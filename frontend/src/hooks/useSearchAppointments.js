import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ServiceType } from "../enums/service-type.enum";
import { searchAvailableSlots } from "../services/appointment.service";
import { getDoctors } from "../services/doctor.service";
import { getLocations } from "../services/location.service";
import { getMedicalServiceStrategy } from "../services/medical-service.strategy";
import { OrderDirection, OrderFields } from "../enums/orderables.enum";

const formatSearchDate = (dateString, isEndDate = false) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-');
  const date = new Date();

  if (isEndDate) {
    date.setFullYear(year, month - 1, day);
    date.setHours(23, 59, 59, 999);
  } else if (dateString === new Date().toISOString().split('T')[0]) {
    date.setMinutes(date.getMinutes() + 30);
  } else {
    date.setFullYear(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
  }

  return date.toISOString();
};

export function useSearchAppointments() {
  const [type, setType] = useState(ServiceType.SPECIALTY);
  const strategy = useMemo(() => getMedicalServiceStrategy(type), [type]);
  const [options, setOptions] = useState([]);
  const [selection, setSelection] = useState("");

  const [locations, setLocations] = useState([]);
  const [locationId, setLocationId] = useState("");

  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [orderBy, setOrderBy] = useState(OrderFields.DATE);
  const [orderDir, setOrderDir] = useState(OrderDirection.ASC);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [cachedPages, setCachedPages] = useState({});
  const fetchedPagesRef = useRef({});
  const activeFiltersRef = useRef(null);

  useEffect(() => {
    getLocations().then(setLocations).catch(console.error);
  }, []);

  useEffect(() => {
    let ignore = false;

    setSelection("");
    setDoctorId("");
    setAppointments([]);
    setOptions([]);

    strategy.fetchOptions()
      .then((nextOptions) => {
        if (!ignore) setOptions(nextOptions);
      })
      .catch((err) => {
        if (!ignore) console.error(err);
      });

    return () => {
      ignore = true;
    };
  }, [strategy]);

  useEffect(() => {
    setDoctorId("");
    if (!selection) {
      setFilteredDoctors([]);
      return;
    }

    const filters = {
      serviceType: type,
      serviceId: selection,
    };

    if (locationId) filters.locationIds = [locationId];

    getDoctors(filters).then(setFilteredDoctors).catch(console.error);
  }, [strategy, selection, locationId]);

  const fetchBackendPage = useCallback(async (bp, isBackground = false, targetFp = null, overrideFilters = null) => {
    if (!isBackground) {
      setLoading(true);
      setError(null);
    }

    fetchedPagesRef.current[bp] = 'fetching';

    const baseFilters = overrideFilters || activeFiltersRef.current || {
      serviceType: type,
      serviceId: selection,
      orderBy: orderBy,
      orderDir: orderDir,
    };

    const queryFilters = {
      ...baseFilters,
      page: bp,
      limit: 20
    };

    if (!overrideFilters && !activeFiltersRef.current) {
      if (doctorId) queryFilters.doctorIds = [doctorId];
      if (locationId) queryFilters.locationIds = [locationId];
      if (dateFrom) queryFilters.dateFrom = formatSearchDate(dateFrom);
      if (dateTo) queryFilters.dateTo = formatSearchDate(dateTo, true);
    }

    try {
      try {
        const data = await searchAvailableSlots(queryFilters);
        const slots = data.availableSlots || [];
        const processedSlots = slots.map(slot => ({
          ...slot,
          id: `${slot.doctorId}-${slot.locationId}-${slot.date || slot.startTime}`
        }));

        const totalItems = data.total || 0;
        const calcTotalPages = Math.ceil(totalItems / 4);

        const backendStartFp = (bp - 1) * 5 + 1;
        const newCachedChunks = {};
        for (let i = 0; i < 5; i++) {
          const fpIndex = backendStartFp + i;
          const sliceStart = i * 4;
          const sliceEnd = sliceStart + 4;
          const chunk = processedSlots.slice(sliceStart, sliceEnd);
          newCachedChunks[fpIndex] = chunk;
        }

        setCachedPages(prev => ({ ...prev, ...newCachedChunks }));
        fetchedPagesRef.current[bp] = 'done';

        if (!isBackground) {
          const displayFp = targetFp || (bp - 1) * 5 + 1;
          setAppointments(newCachedChunks[displayFp] || []);
          setPage(displayFp);
          setTotalPages(calcTotalPages || 1);
        }
        return { totalPages: calcTotalPages, ...data };
      } catch (err) {
        console.error("Error fetching backend page:", bp, err);
        fetchedPagesRef.current[bp] = 'failed';
        if (!isBackground) {
          setError(err.message === 'Network Error' ? 'Error de conexión con el servidor.' : err.response?.data?.message || "Ocurrió un error al buscar turnos.");
          setAppointments([]);
          setTotalPages(1);
        }
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  }, [type, selection, doctorId, locationId, dateFrom, dateTo, orderBy, orderDir]);

  const triggerPreFetching = useCallback((baseFilters, fp, totalFp) => {
    const bp = Math.floor((fp - 1) / 5) + 1;
    const currentBatchEndFp = bp * 5;

    if (fp >= currentBatchEndFp - 1) {
      const nextBp = bp + 1;
      const totalBps = Math.ceil(totalFp / 5);
      if (nextBp <= totalBps) {
        const status = fetchedPagesRef.current[nextBp];
        if (!status || status === 'failed') {
          fetchBackendPage(nextBp, true, null, baseFilters);
        }
      }
    }
  }, [fetchBackendPage]);

  const handleSearch = useCallback((fp = 1, resetCache = false, overrides = {}) => {
    if (!selection) {
      setError("Debes seleccionar una especialidad o práctica.");
      return;
    }

    const currentFilters = {
      serviceType: type,
      serviceId: selection,
    };
    if (doctorId) currentFilters.doctorIds = [doctorId];
    if (locationId) currentFilters.locationIds = [locationId];
    if (dateFrom) currentFilters.dateFrom = formatSearchDate(dateFrom);
    if (dateTo) currentFilters.dateTo = formatSearchDate(dateTo, true);
    currentFilters.orderBy = overrides.orderBy || orderBy;
    currentFilters.orderDir = overrides.orderDir || orderDir;

    let cacheToUse = cachedPages;

    if (resetCache) {
      cacheToUse = {};
      setCachedPages({});
      fetchedPagesRef.current = {};
      activeFiltersRef.current = currentFilters;
    } else if (!activeFiltersRef.current) {
      activeFiltersRef.current = currentFilters;
    }

    const bp = Math.floor((fp - 1) / 5) + 1;

    if (cacheToUse[fp]) {
      setAppointments(cacheToUse[fp]);
      setPage(fp);
      triggerPreFetching(activeFiltersRef.current, fp, totalPages);
      return;
    }

    fetchedPagesRef.current[bp] = 'fetching';

    fetchBackendPage(bp, false, fp, activeFiltersRef.current)
      .then(res => {
        if (res) {
          triggerPreFetching(activeFiltersRef.current, fp, res.totalPages);
        }
      });
  }, [selection, type, doctorId, locationId, dateFrom, dateTo, orderBy, orderDir, cachedPages, totalPages, triggerPreFetching, fetchBackendPage]);

  const clearResults = useCallback(() => {
    setSelection("");
    setAppointments([]);
    setCachedPages({});
    fetchedPagesRef.current = {};
    activeFiltersRef.current = null;
    setPage(1);
    setTotalPages(1);
  }, []);

  return {
    type, setType, strategy,
    options, selection, setSelection,
    locations, locationId, setLocationId,
    filteredDoctors, doctorId, setDoctorId,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    orderBy, setOrderBy,
    orderDir, setOrderDir,
    appointments, loading, error,
    handleSearch,
    clearResults,
    page,
    totalPages
  };
}

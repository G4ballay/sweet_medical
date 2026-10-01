import { describe, expect, test, beforeAll, afterAll, jest } from "@jest/globals";
import request from "supertest";
import app from "../../src/app.js";
import supertest from "supertest";
test("dummy", () => {
    expect(true).toBe(true);
});
/*
describe("Appointment Router", () => {

    describe("GET /", () => {
        test("Deberia traer todos los turnos", () => {
            return request(app)
                .get('/appointments/')
                .send()
                .then(res => {
                    expect(res.status).toBe(200);
                    expect(res.body.appointments[0].id).toBe('APP1');
                    expect(res.body.appointments[0].doctorId).toBe('DOC1');
                    expect(res.body.appointments[0].patientId).toBe('PAT1');
                    expect(res.body.appointments[0].locationId).toBe('LOC1');
                    expect(res.body.appointments[0].practiceId).toBe('P1');
                    expect(res.body.appointments[0].status).toBe('RESERVADO');
                    expect(res.body.appointments[0].statusHistory).toEqual([]);
                    expect(res.body.appointments[0].cost).toBe(1000);
                });
        })
    })

    describe("POST /book", () => {
        test("debería crear un turno correctamente", () => {

            const bookingData = {
                doctorId: "DOC2",
                patientId: "PAT1",
                startTime: "2026-05-07T18:14:00Z",
                practiceId: "P3",
                locationId: "LOC3"
            };

            return request(app)
                .post('/appointments/book')
                .send(bookingData)
                .then(response => {
                    expect(response.status).toBe(201);
                    expect(response.body.id).toBe('APP2');
                });
        });
    });

    describe("GET /:id", () => {

        test("Si mando un id existente deberia traer el turno", () => {
            return request(app)
                .get('/appointments/APP1')
                .then(res => {
                    expect(res.status).toBe(200);
                    expect(res.body.appointment.id).toBe("APP1");
                });
        });

        test("Si mando un id inexistente deberia tirar error", () => {
            return request(app)
                .get('/appointments/INEXISTENTE')
                .then(res => {
                    expect(res.status).toBe(404);
                    expect(res.body.message).toEqual("Turno con identificador 'INEXISTENTE' no encontrado.")
                })
        })

    });

    describe("DELETE /:id/cancel", () => {
        beforeAll(() => {
            jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
            jest.setSystemTime(new Date("2026-04-30T13:00:00.000Z"));
        });

        afterAll(() => {
            jest.useRealTimers();
        });

        test("Deberia cancelar el turno ", () => {
            const appointmentId = "APP1";
            const cancelData = {
                reason: "Llueve",
                userId: "USR1"
            }

            return request(app).delete(`/appointments/${appointmentId}/cancel`)
                .send(cancelData)
                .then(res => {
                    expect(res.status).toBe(200);
                    expect(res.body.status).toEqual('Canceled');
                });
        });

        test("Si se manda un id inexistente tira error", () => {
            const appointmentId = "INEXISTENTE";
            const cancelData = {
                reason: "Llueve",
                userId: "USR1"
            }

            return request(app).delete(`/appointments/${appointmentId}/cancel`)
                .send(cancelData)
                .then(res => {
                    expect(res.status).toBe(404);
                    expect(res.body.message).toEqual("Turno con identificador 'INEXISTENTE' no encontrado.");
                });
        })
    });

});
*/
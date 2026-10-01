import SweetMedicalIcon from '@/assets/logo.svg?react';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Box, Container, IconButton, Link, SvgIcon, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box sx={{ background: (t) => t.custom.gradientPrimary, color: 'secondary.main', pt: { xs: 8, md: 10 }, pb: { xs: 5, md: 6 } }}>
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", gap: 6 }}>
          {/* LEFT */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <SvgIcon component={SweetMedicalIcon} inheritViewBox sx={{ fontSize: 40, color: 'secondary.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Sweet Medical
              </Typography>
            </Box>
            <Typography sx={{ color: "rgba(255,255,255,0.82)", maxWidth: 420, lineHeight: 1.9, fontSize: "1rem" }}>
              Gestioná tus turnos médicos de forma simple, rápida y segura desde cualquier lugar.
            </Typography>
          </Box>
          {/* RIGHT */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Contacto
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.82)", mb: 1.5 }}>
              contacto@sweetmedical.com
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.82)", mb: 4 }}>
              +54 11 1234-5678
            </Typography>
            {/* SOCIALS */}
            <Box sx={{ display: "flex", gap: 1 }}>
              {[
                { icon: InstagramIcon, label: "Instagram" },
                { icon: LinkedInIcon, label: "LinkedIn" },
                { icon: TwitterIcon, label: "Twitter" },
              ].map(({ icon: Icon, label }, i) => (
                <IconButton
                  key={i}
                  aria-label={label}
                  sx={{
                    color: 'secondary.main',
                    backgroundColor: "rgba(255,255,255,0.12)",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.20)" },
                  }}
                >
                  <Icon />
                </IconButton>
              ))}
            </Box>
          </Box>
        </Box>
        {/* BOTTOM */}
        <Box sx={{ mt: { xs: 6, md: 8 }, pt: 4, borderTop: "1px solid rgba(255,255,255,0.18)", display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          <Typography sx={{ color: "rgba(255,255,255,0.72)", fontSize: "0.95rem" }}>
            © 2026 Sweet Medical - Grupo 9. Todos los derechos reservados.
          </Typography>
          <Box sx={{ display: "flex", gap: 3 }}>
            {['Términos', 'Privacidad'].map((text) => (
              <Link
                key={text}
                component="button"
                variant="body2"
                onClick={() => {}}
                sx={{
                  color: "rgba(255,255,255,0.72)",
                  cursor: "pointer",
                  textDecoration: "none",
                  "&:hover": { color: 'secondary.main', textDecoration: "underline" }
                }}
              >
                {text}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
import { Paper, Typography } from "@mui/material";

export default ({ children, title, wide=false }) => (
  <Paper
    elevation={5}
    className="graph"
    sx={{
      width: "100%", // maybe I'll try 90?
      maxWidth: wide ? '800px' : '500px',
      backgroundColor: "brand.white",
      borderRadius: "10px",
      padding: {xs: "6px", md: "18px"},
      paddingTop: 0 /* the margin from the h3 tags is enough */,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      pageBreakInside: "avoid",
    }}
  >
    <Typography variant="h5">{title}</Typography>
    {children}
  </Paper>
);
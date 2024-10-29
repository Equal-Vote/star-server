import { Box } from "@mui/material";

export default ({ children }) => <Box
  display="flex"
  flexDirection="row"
  flexWrap="wrap"
  gap="30px"
  className="graphs"
  justifyContent="center"
  sx={{ marginBottom: "30px" }}
>
  {children}
</Box>


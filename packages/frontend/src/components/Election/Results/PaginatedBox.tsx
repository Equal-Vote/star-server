/*
  PaginatedBox -- Put up a box with page numbers at the bottom.
*/

import { Pagination } from "@mui/material";
import Widget from "./components/Widget";
import WidgetContainer from "./components/WidgetContainer";

const PaginatedBox = ({
  children, pageCount, title, page, setPage /* one-based */
}) => {
  if (1 === pageCount) return <>{children}</>;
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value); /* closure */
  };
  return <WidgetContainer>
    <Widget title={title} wide>
      {children}
      <Pagination count={pageCount} page={page} onChange={handleChange} />
    </Widget>
  </WidgetContainer>
};

export default PaginatedBox

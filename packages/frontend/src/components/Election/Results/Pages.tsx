import { Pagination } from "@mui/material";
import Widget from "./components/Widget";
import WidgetContainer from "./components/WidgetContainer";

const Pages = ({
  children, pageCount, title, page, setPage /* one-based */
}) => {
  if (1 === pageCount) return <>{children}</>;
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value); /* closure */
  };
  if (title) return <WidgetContainer>
    <Widget title={title} wide>
      {children}
      <Pagination count={pageCount} page={page} onChange={handleChange} />
    </Widget>
  </WidgetContainer>;
  return <>
    {children}
    <Pagination count={pageCount} page={page} onChange={handleChange} />
  </>
};

export default Pages

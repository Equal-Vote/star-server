import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import {
  Box,
  Grid,
  IconButton,
  Paper,
  TableContainer,
  Typography,
} from "@mui/material";
import React, { useState, useRef, useEffect } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ComposedChart,
  Label,
  LabelList,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import _uniqueId from "lodash/uniqueId";
import { DateTime } from "luxon";
import { useTranslation } from "react-i18next";

export const CHART_COLORS = [
  "var(--ltbrand-blue)",
  "var(--ltbrand-green)",
  "var(--ltbrand-lime)",
];

export const WidgetContainer = ({ children }) => (
  <Box
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
);

const truncName = (name, maxSize) => {
  if (name.length <= maxSize) return name;
  return name.slice(0, maxSize - 3).concat("...");
};

export const ResultsBarChart = ({
  data,
  runoff = false,
  colorOffset = 0,
  sortFunc = undefined,
  xKey = "votes",
  percentage = false,
  percentDenominator = undefined,
  star = false,
  majorityLegend = undefined,
  majorityOffset = false,
  height = undefined,
}) => {
  let rawData = data;

  // Truncate names & add percent
  percentDenominator ??= data.reduce((sum, d) => sum + d[xKey], 0);
  percentDenominator = Math.max(1, percentDenominator);
  data = rawData.map((d, i) => {
    let s = {
      ...d,
      name: (star && i == 0 ? "⭐" : "") + truncName(d["name"], 40),
      // hack to get smaller values to allign different than larger ones
      left: percentage
        ? `${Math.round((100 * d[xKey]) / percentDenominator)}%`
        : d[xKey],
      right: "",
    };

    if (d[xKey] / percentDenominator < 0.1 || (majorityLegend && i == 0)) {
      s["right"] = s["left"];
      s["left"] = "";
    }

    return s;
  });

  // Sort entries
  if (sortFunc != false) {
    // we're handling undefined and false difference, so that's why this is explicit
    data.sort(
      sortFunc ??
        ((a, b) => {
          return b[xKey] - a[xKey];
        })
    );
  }

  // compute colors
  let colors = [...CHART_COLORS];
  for (let i = 0; i < colorOffset; i++) {
    colors.push(colors.shift());
  }
  if (runoff) {
    colors = colors.slice(0, 2).concat(["var(--brand-gray-1)"]);
  }

  // Add majority
  if (majorityLegend || majorityOffset) {
    let m = (data[0][xKey] + data[1][xKey]) / 2;
    data = data.map((d, i) => {
      let s = { ...d };
      s[majorityLegend] = i < 2 ? m : null;
      return s;
    });
    let s = { name: "" };
    s[majorityLegend] = m;
    data.unshift(s);
    colors.unshift(colors.pop());
  }

  // Truncate entries
  const maxCandidates = 10;
  if (rawData.length > maxCandidates) {
    data = data.slice(0, maxCandidates - 1);
    let item = {
      name: `+${rawData.length - (maxCandidates - 1)} more`,
      index: 0,
    };
    item[xKey] = "";
    data.push(item);
  }

  // Size margin to longest candidate
  const longestCandidateName = data.reduce(function (a, b) {
    return a.name.length > b.name.length ? a : b;
  }).name;

  // 200 is about the max width I'd want for a small mobile device, still looking for a better solution though
  const axisWidth = Math.max(
    50,
    Math.min(
      200,
      15 * (longestCandidateName.length > 20 ? 20 : longestCandidateName.length)
    )
  );

  return (
    <ResponsiveContainer width="90%" height={50 * data.length}>
      <ComposedChart data={data} barCategoryGap={5} layout="vertical">
        <XAxis hide axisLine={false} type="number" />
        <YAxis
          dataKey="name"
          type="category"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: ".9rem", fill: "black", fontWeight: "bold" }}
          width={axisWidth}
        />
        <Bar
          stackOffset="expand"
          dataKey={xKey}
          fill="#026A86"
          unit="votes"
          legendType="none"
        >
          <LabelList dataKey="left" position="insideRight" fill="black" />
          <LabelList dataKey="right" position="right" fill="black" />
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
        <Line
          dataKey={majorityLegend}
          dot={false}
          stroke="black"
          strokeWidth={3}
          strokeDasharray="6 6"
          legendType="plainline"
        />
        {majorityLegend && <Legend />}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export const ResultsPieChart = ({ data, colorOffset = 0, star = false }) => {
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="black"
        style={{ fontWeight: "bold", textAlign: "center" }}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  let pieColors = [
    CHART_COLORS[colorOffset % CHART_COLORS.length],
    CHART_COLORS[(colorOffset + 1) % CHART_COLORS.length],
    "var(--brand-gray-2)",
  ];

  const pieAngle = 90;

  let rawData = data;

  // Truncate names
  data = rawData.map((d, i) => ({
    ...d,
    name: (star && i == 0 ? "⭐" : "") + truncName(d["name"], 20),
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="votes"
          startAngle={pieAngle}
          endAngle={pieAngle + 360}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={pieColors[index]}
              stroke="var(--brand-white)"
              strokeWidth={6}
            />
          ))}
        </Pie>
        <Legend
          layout="vertical"
          verticalAlign="top"
          align="right"
          formatter={(value) => (
            <span
              style={{ color: "black", fontWeight: "bold", fontSize: ".9rem" }}
            >
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const Widget = ({ children, title }) => (
  <Paper
    elevation={5}
    className="graph"
    sx={{
      width: "100%", // maybe I'll try 90?
      maxWidth: "500px",
      backgroundColor: "brand.white",
      borderRadius: "10px",
      padding: "18px",
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

export const ResultsTable = ({ className, data, minCellWidth = "120px" }) => {
  let c = `resultTable ${className}`;

  return (
    <TableContainer
      sx={{
        marginLeft: "auto",
        marginRight: "auto",
        maxHeight: 600,
        width: "100%",
      }}
    >
      <table className={c}>
        <thead className={c}>
          <tr>
            {data[0].map((header, i) => (
              <th key={i} className={c}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(1).map((row, i) => (
            <tr className={c} key={i}>
              {row.map((value, j) => (
                <td
                  key={j}
                  className={c}
                  style={{ paddingLeft: j == 0 ? "8px" : "0" }}
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </TableContainer>
  );
};

export const openFeedback = () => {
  // simulate clicking the feedback button
  const launcherFrame = document.getElementById("launcher-frame");
  const button =
    launcherFrame.contentWindow.document.getElementsByClassName(
      "launcher-button"
    )[0];
  button.click();
};

export function scrollToElement(e) {
  setTimeout(() => {
    // TODO: I feel like there's got to be an easier way to do this
    let openedSection = typeof e === "function" ? e() : e;

    if (NodeList.prototype.isPrototypeOf(openedSection)) {
      // NOTE: NodeList could contain a bunch of hidden elements with height 0, so we're filtering those out
      openedSection = Array.from(openedSection).filter((e) => {
        const box = e.getBoundingClientRect();
        return box.bottom - box.top > 0;
      });
      if (openedSection.length == 0) return;
      openedSection = openedSection[0];
    }

    const navBox = document.querySelector("header").getBoundingClientRect();
    const navHeight = navBox.bottom - navBox.top;

    const elemTop =
      document.documentElement.scrollTop +
      openedSection.getBoundingClientRect().top -
      30;
    const elemBottom = elemTop + openedSection.scrollHeight;
    const windowTop = document.documentElement.scrollTop;
    const windowBottom = windowTop + window.innerHeight;

    if (elemTop < windowTop || elemBottom > windowBottom) {
      window.scrollTo({
        top: elemTop - navHeight,
        behavior: "smooth",
      });
    }
  }, 250);
}

export const DetailExpander = ({ children, level = 0 }) => {
  const [viewDetails, setViewDetails] = useState(false);
  const expanderId = useRef(_uniqueId("detailExpander")).current;

  let { t } = useTranslation();
  let title = [
    t("results.general.details"),
    t("results.general.additional_info"),
  ][level];

  return (
    <>
      <Box
        className={`detailExpander ${expanderId}`}
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 10,
          justifyContent: "center",
          cursor: "pointer",
          alignItems: "center",
        }}
        onClick={() => {
          if (!viewDetails)
            scrollToElement(document.querySelector(`.${expanderId}`));
          setViewDetails(!viewDetails);
        }}
      >
        <Typography variant="h6" sx={{ "@media print": { display: "none" } }}>
          {title}
        </Typography>
        {!viewDetails && (
          <ExpandMore sx={{ "@media print": { display: "none" } }} />
        )}
        {viewDetails && (
          <ExpandLess sx={{ "@media print": { display: "none" } }} />
        )}
      </Box>
      {viewDetails && children}
    </>
  );
};

export const DetailExpanderGroup = ({
  children,
  defaultSelectedIndex,
  allowMultiple = false,
}) => {
  const [openedWidgets, setOpenedWidgets] = useState([]);

  const groupRef = useRef(null);

  if (!Array.isArray(children) || children.length <= 1) return <>{children}</>;

  if (openedWidgets.length == 0)
    setOpenedWidgets(
      new Array(Array.isArray(children) ? children.length : 0).fill(false)
    );

  return (
    <div ref={groupRef} className="detailExpanderGroup">
      {children.map((child, i) => (
        <Paper
          key={`detail-expander-group-${i}`}
          elevation={5}
          sx={{ backgroundColor: "brand.white", padding: "8px", width: "100%" }}
        >
          <div
            className="detailSection"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flexStart",
              cursor: "pointer",
              pageBreakAfter: "avoid",
            }}
            onClick={() => {
              if (!openedWidgets[i]) {
                scrollToElement(
                  groupRef.current.querySelectorAll(`.detailSection`)[i]
                    .parentNode
                );
              }
              setOpenedWidgets(
                openedWidgets.map((v, j) => {
                  if (allowMultiple) {
                    return i == j ? !v : v;
                  } else {
                    return i == j;
                  }
                })
              );
            }}
          >
            <Typography variant="h6">{child.props.title}</Typography>
            <IconButton sx={{ "@media print": { display: "none" } }}>
              {openedWidgets[i] ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </div>
          {openedWidgets[i] && (
            <>
              <hr style={{ pageBreakAfter: "avoid" }} />
              <div style={{ textAlign: "left" }}>{child}</div>
            </>
          )}
        </Paper>
      ))}
    </div>
  );
};

export const formatDate = (time, displayTimezone = null) => {
  if (!time) return "";
  if (displayTimezone === null) displayTimezone = DateTime.now().zone.name;

  return DateTime.fromJSDate(new Date(time))
    .setZone(displayTimezone)
    .toLocaleString(DateTime.DATETIME_FULL);
};

export const isValidDate = (d) => {
  if (d instanceof Date) return !isNaN(d.valueOf());
  if (typeof d === "string") return !isNaN(new Date(d).valueOf());
  return false;
};

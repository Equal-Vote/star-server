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
import { Trans, useTranslation } from "react-i18next";
import en from '../i18n/en.yaml';
import { Tip } from "./styles";
import i18n from "~/i18n/i18n";

const rLink = /\[(.*?)\]\((.*?)\)/;
const rTip = / \!tip\((.*)\)/


declare namespace Intl {
    class ListFormat {
        constructor(locales?: string | string[], options?: {});
        public format: (items: string[]) => string;
    }
    class DateTimeFormat {
        constructor(tz?: string, options?: {});
        public format: (item: DateTime) => string;
    }
}

const commaListFormatter = new Intl.ListFormat(i18n.languages[0], { style: 'long', type: 'conjunction' });

export const useOnScrollAnimator = () => {
    //https://www.youtube.com/watch?v=T33NN_pPeNI
    const observer = new IntersectionObserver((entries) => {
        entries.filter(entry => entry.isIntersecting).forEach(entry => entry.target.classList.add('show'))
    })

    useEffect(() => {
        document.querySelectorAll('.scrollAnimate').forEach(ref => observer.observe(ref))
    })

    const makeSx=(delay, duration, before={}, after={}) => ({
          opacity: 0, ...before,
            '&.show': {opacity: 1, transition: `all ${duration}`, transitionDelay: delay, ...after}
      })

    return {
        FadeIn: ({children, delay='0', duration='1s'}) => <Box className='scrollAnimate' sx={makeSx(delay, duration)}>
            {children}
        </Box>,
        FadeUp: ({children, delay='0', duration='1s'}) => <Box className='scrollAnimate' sx={
          makeSx(delay, duration, {transform: 'translate(0, 40px)'}, {transform: 'translate(0, 0)'})
        }>
            {children}
        </Box>,
    }
}

// NOTE: I'm setting a electionTermType default for backwards compatibility with elections that don't have a term set
export const useSubstitutedTranslation = (electionTermType='election', v={}) => { // election or poll
  const processValues = (values) => {
    Object.entries(values).forEach(([key, value]) => {
      if(typeof value === 'string'){
        if(key == 'datetime' || key == 'listed_datetime'){
          values[key] = new Date(value)
        }else{
          values[`lowercase_${key}`] = value.toLowerCase()
        }
      }
      if(Array.isArray(value)){
        values[key] = commaListFormatter.format(value);
      }
    })
    return values
  }

  let values = processValues({...en.keyword, ...en.keyword[electionTermType], ...v, formatParams: {
    datetime: {
      year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric',
      timeZoneName: 'short', timeZone: v['time_zone'] ?? undefined
    },
    listed_datetime: {
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
      timeZoneName: undefined, timeZone: v['time_zone'] ?? undefined
    },
  }})

  const { t, i18n } = useTranslation()

  const applySymbols = (txt) => {
    const applyLinks = (txt) => {
      if(typeof txt !== 'string') return txt;
      let parts = txt.split(rLink)
      return parts.map((str, i) => {
        if(i%3 == 0) return str;
        if(i%3 == 2) return '';
        return <a key={`link_${i}`} href={parts[i+1]}>{parts[i]}</a>
      })
    }

    const applyTips = (txt, keyPrefix) => {
      if(typeof txt !== 'string') return txt;
      return txt.split(rTip).map((str, i) => {
          if(i%2 == 0) return str;
          return <Tip key={`tip_${keyPrefix}_${i}`} name={str}/>
      })
    }

    const applyLineBreaks = (txt, keyPrefix) => {
      if(typeof txt !== 'string') return txt;
      let parts = txt.split('\n');
      return parts.map((part,i) => i == (parts.length-1)? part : [part, <br key={`br_${keyPrefix}_${i}`}/>]).flat();
    }

    // hack for testing if we've missed any text
    // return '----'; 

    if(!rLink.test(txt) && !rTip.test(txt) && !txt.includes('\n')) return txt;

    return <>
      {applyLinks(txt)
        .map((comp, i) => applyTips(comp, i)).flat()
        .map((comp, i) => applyLineBreaks(comp, i)).flat()
      }
    </>
  }

  const handleObject = (obj) => {
    if(typeof obj == 'number') return obj;
    if(typeof obj === 'string') return applySymbols(obj);
    if(Array.isArray(obj)) return obj.map(o => handleObject(o));

    let newObj = {};
    Object.entries(obj).forEach(([key, value]) => {
      newObj[key] = handleObject(value);
    })
    return newObj;
  }

  return {
    t: (key, v={}) => handleObject(t(key, {...values, ...processValues(v)})),
    i18n,
  }
}

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
  if (!(typeof name === 'string')) return name;
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

  // TODO: try calculating text width: https://www.geeksforgeeks.org/calculate-the-width-of-the-text-in-javascript/
  // 150 is about the max width I'd want for a small mobile device, still looking for a better solution though
  const axisWidth = Math.max(
    50,
    Math.min(
      150, // 150 since that's the width of Equal Preferences
      15 * (longestCandidateName.length > 20 ? 20 : longestCandidateName.length)
    )
  );

  return (
    <ResponsiveContainer width="90%" height={50 * data.length} >
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
          dataKey={xKey}
          fill="#026A86"
          unit="votes"
          legendType="none"
          style={{overflow: 'visible'}}
        >
          {/* corresponds to mui md size */}
          {/* also this won't dynamically adjust with resizing the screen  */}
          {window.innerWidth > 900 ? <> 
            <LabelList dataKey="left" position="insideRight" fill="black" />
            <LabelList dataKey="right" position="right" fill="black" />
          </>:<>
            <LabelList dataKey="left" position="insideLeft" fill="black" />
            <LabelList dataKey="right" position="insideLeft" fill="black" />
          </>}
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
      <table className={c} style={{minWidth: '100%'}}>
        <thead className={c}>
          <tr>
            {data[0].map((header, i) => (
              <th key={i} className={c} style={{minWidth: i == 0 ? '125px' : '75px'}} >
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
                  style={{
                    paddingLeft: j == 0 ? "8px" : "0",
                  }}
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
    (launcherFrame as HTMLIFrameElement).contentWindow.document.getElementsByClassName(
      "launcher-button"
    )[0];
  (button as HTMLButtonElement).click();
};

export function scrollToElement(e) {
  setTimeout(() => {
    // TODO: I feel like there's got to be an easier way to do this
    let openedSection = typeof e === "function" ? e() : e;

    if (NodeList.prototype.isPrototypeOf(openedSection)) {
      // NOTE: NodeList could contain a bunch of hidden elements with height 0, so we're filtering those out
      openedSection = Array.from(openedSection).filter((e) => {
        const box = (e as HTMLElement).getBoundingClientRect();
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

  let { t } = useSubstitutedTranslation();
  let title = [
    t("results.details"),
    t("results.additional_info"),
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

export const epochToDateString = (e) => {
  let d = new Date(0);
  d.setUTCSeconds(e / 1000);
  return d.toString();
}

export const isValidDate = (d) => {
  if (d instanceof Date) return !isNaN(d.valueOf());
  if (typeof d === "string") return !isNaN(new Date(d).valueOf());
  return false;
};

export const getLocalTimeZoneShort = () => {
  return DateTime.local().offsetNameShort
}

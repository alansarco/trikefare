

import { useRef, useEffect, useState, useMemo } from "react";

// porp-types is a library for typechecking of props
import PropTypes from "prop-types";

// react-chartjs-2 components
import { Line } from "react-chartjs-2";

// @mui material components
import Card from "@mui/material/Card";

// React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";

// React helper functions
import gradientChartLine from "assets/theme/functions/gradientChartLine";

// GradientLineChart configurations
import configs from "essentials/Charts/LineCharts/GradientLineChart/configs";

// React base styles
import colors from "assets/theme/base/colors";
import AbsoluteLoading from "components/General/AbsoluteLoading";

function GradientLineChart({ title, description, height, chart, loading, currentpopulation }) {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({});
  const { data, options } = chartData;

  useEffect(() => {
    const chartDatasets = chart.datasets
      ? chart.datasets.map((dataset) => ({
          ...dataset,
          tension: 0.2,
          pointRadius: 0,
          borderWidth: 3,
          borderColor: colors[dataset.color]
            ? colors[dataset.color || "dark"].main
            : colors.dark.main,
          fill: true,
          maxBarThickness: 6,
          backgroundColor: gradientChartLine(
            chartRef.current.children[0],
            colors[dataset.color] ? colors[dataset.color || "dark"].main : colors.dark.main
          ),
        }))
      : [];

    setChartData(configs(chart.labels || [], chartDatasets));
  }, [chart]);

  const renderChart = (
    <SoftBox p={2}>
      {loading && <AbsoluteLoading /> }
      {title || description ? (
        <SoftBox px={description ? 1 : 0} pt={description ? 1 : 0}>
          {title && (
            <SoftBox mb={1}>
              <SoftTypography variant="h6">{title} <span className="text-info  text-gradient">({currentpopulation} rides)</span></SoftTypography>
            </SoftBox>
          )}
          <SoftBox mb={2}>
            <SoftTypography component="div" variant="button" fontWeight="regular" color="text">
              {description}
            </SoftTypography>
          </SoftBox>
        </SoftBox>
      ) : null}   
      {useMemo( 
        () => ( 
          <SoftBox>
            <SoftBox ref={chartRef} md={{ height }}>  
              <Line data={data} options={options}/>
            </SoftBox>
          </SoftBox>
          
        ),
        [chartData, height]
      )}
    </SoftBox>
  );

  return title || description ? <Card>{renderChart}</Card> : renderChart;
}

// Setting default values for the props of GradientLineChart
GradientLineChart.defaultProps = {
  title: "",
  description: "",
  height: "19.125rem",
};

// Typechecking props for the GradientLineChart
GradientLineChart.propTypes = {
  title: PropTypes.string,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  chart: PropTypes.objectOf(PropTypes.array).isRequired,
};

export default GradientLineChart;

<script>
  import { Chart } from "frappe-charts";
  import { Temporal } from "@js-temporal/polyfill";
  import { onMount } from "svelte";

  const { stats } = $$props;
  const listedStats = Object.entries(stats["history"]).map(([date, data]) => {
    return {
      date,
      ...data,
    };
  });

  const showHeatmap = () => {
    const dataPoints = {};
    listedStats.forEach((s) => {
      const unixSeconds = Math.floor(
        Temporal.PlainDate.from(s.date).toZonedDateTime({
          timeZone: "UTC",
        }).epochMilliseconds / 1000
      );
      dataPoints[unixSeconds] = s.characters;
    });

    const today = Temporal.Now.zonedDateTimeISO("UTC");
    const startDate = Math.floor(today.epochMilliseconds / 1000);
    const endDate = Math.floor(
      today.subtract({ months: 3 }).epochMilliseconds / 1000
    );

    const data = {
      dataPoints,
      startDate,
      endDate,
    };
    const chart = new Chart("#heatmap", {
      type: "heatmap",
      data,
    });
  };

  const showFilesAndCharactersChart = () => {
    const data = {
      labels: listedStats.filter((_, i) => i % 7 === 0).map((s) => s.date),
      datasets: [
        {
          name: "Files",
          type: "bar",
          values: listedStats.filter((_, i) => i % 7 === 0).map((s) => s.files),
        },
        {
          name: "Characters",
          type: "line",
          values: listedStats
            .filter((_, i) => i % 7 === 0)
            .map((s) => s.totalCharacters),
        },
      ],
    };
    const chart = new Chart("#fc-chart", {
      type: "axis-mixed",
      data,
      height: 300,
      colors: ["#7cd6fd", "#743ee2"],
      isNavigable: true,
      axisOptions: {
        xAxisMode: "tick",
        xIsSeries: true,
        yAxisMode: "span",
        yAxis: [
          {
            title: "Files",
            labelFormatter: (y) => y,
          },
          {
            title: "Characters",
            opposite: true,
            labelFormatter: (y) => y,
          },
        ],
      },
    });
  };

  onMount(() => {
    showHeatmap();
    showFilesAndCharactersChart();
  });
</script>

<div class="container markdown-reading-view">
  <div class="inline-title">Stats</div>
  <div class="chart-container">
    <div class="el-h2"><h2>Heatmap</h2></div>
    <div class="chart-wrapper">
      <div id="heatmap">Chart will be here</div>
    </div>
  </div>
  <div class="chart-container">
    <div class="el-h2"><h2>Files and Characters</h2></div>
    <div class="chart-wrapper">
      <div id="fc-chart">Chart will be here</div>
    </div>
  </div>
</div>

<style>
  .container {
    padding-inline: 1.25rem;
    padding-block: 1.25rem;
  }
  .chart-container {
    width: 100%;
    height: 100%;
  }
  .chart-wrapper {
    width: 100%;
    height: 100%;
    overflow: auto;
  }
  h2 {
    margin: 0;
  }
</style>

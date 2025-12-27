import { ChartJSNodeCanvas } from "chartjs-node-canvas";

const canvas = new ChartJSNodeCanvas({ width: 600, height: 300 });

export async function generateMatchChart(matches: any[]) {
  return canvas.renderToBuffer({
    type: "bar",
    data: {
      labels: matches.map(m => m.sku),
      datasets: [{
        label: "Match Score",
        data: matches.map(m => m.matchScore),
        backgroundColor: "#2563eb",
      }],
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}

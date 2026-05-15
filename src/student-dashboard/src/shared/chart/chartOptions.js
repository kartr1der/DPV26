export const tooltipOptions = {
  backgroundColor: '#172235',
  titleFont: { size: 12, weight: '700' },
  bodyFont: { size: 12 },
  padding: 10,
  cornerRadius: 6,
}

export function cartesianOptions(mode) {
  const scales = {
    x: {
      grid: { display: false },
      ticks: {
        color: '#526174',
        font: { size: 10, weight: '600' },
        maxRotation: 0,
        minRotation: 0,
      },
    },
    y: {
      min: mode === 'score' ? 3.7 : undefined,
      max: mode === 'score' ? 4.4 : undefined,
      grid: { color: '#edf1f6' },
      ticks: {
        color: '#526174',
        font: { size: 11 },
        callback: (value) => Number(value).toFixed(mode === 'score' ? 1 : 0),
      },
    },
  }

  if (mode === 'score') {
    scales.y1 = {
      position: 'right',
      grid: { drawOnChartArea: false },
      ticks: {
        color: '#526174',
        font: { size: 11 },
      },
    }
  }

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          color: '#394658',
          font: { size: 11, weight: '600' },
        },
      },
      tooltip: tooltipOptions,
    },
    scales,
  }
}

export const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '62%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        font: { size: 11 },
      },
    },
    tooltip: tooltipOptions,
  },
}

export const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { boxWidth: 10, font: { size: 11 } },
    },
    tooltip: tooltipOptions,
  },
  scales: {
    r: {
      min: 0,
      max: 100,
      ticks: {
        stepSize: 25,
        backdropColor: 'transparent',
        font: { size: 10 },
      },
      pointLabels: {
        font: { size: 11, weight: '600' },
      },
      grid: { color: '#dbe4ee' },
      angleLines: { color: '#dbe4ee' },
    },
  },
}

export const scatterOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { boxWidth: 10, font: { size: 11 } },
    },
    tooltip: tooltipOptions,
  },
  scales: {
    x: {
      title: { display: true, text: 'Студентов' },
      grid: { color: '#edf1f6' },
    },
    y: {
      min: 3.7,
      max: 4.4,
      title: { display: true, text: 'Средний балл' },
      ticks: { callback: (value) => Number(value).toFixed(1) },
      grid: { color: '#edf1f6' },
    },
  },
}

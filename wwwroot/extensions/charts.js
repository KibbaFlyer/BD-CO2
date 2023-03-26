const ctx1 = document.getElementById('charts1').getContext('2d');
const ctx2 = document.getElementById('charts2').getContext('2d');

export async function myChart1() {
    // Call the async function to fetch data
    const chartData = await getCO2categoryinfo();
    // Create the chart with the fetched data
    const myChart1 = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: ["Raw Material", "Manufacturing", "Installation", "Operation", "End of Life"],
        datasets: [{
          data: [chartData["Raw Material"],chartData["Manufacturing"],chartData["Installation"],chartData["Operation"],chartData["End of Life"]],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
            title: {
                display: true,
                text: 'Total CO2e per fas [kg]'
            },
            legend: {
               display: false
            }
        },
        scales: {
          y: {
            beginAtZero: true,
            /*ticks: {
                // Include a dollar sign in the ticks
                callback: function(value, index, ticks) {
                    return value + ' kg';
                },
            } */
          }
        },
        responsive: true, // Make the chart responsive
      }
    });
};

export async function myChart2() {
    // Call the async function to fetch data
    const chartData = await getCO2RoomInfo();
    console.log(Object.keys(chartData));
    // Create arrays of labels and values from the chartData object
    const labels = Object.keys(chartData);
    const values = Object.values(chartData);
    // Create the chart with the fetched data
    const myChart1 = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
              {
                label: 'CO2e per Room',
                data: values,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              },
            ],
        },
        options: {
            plugins: {
            title: {
                display: true,
                text: 'Total CO2e per rum [kg|'
            },
            legend: {
                display: false
             }
            },
            responsive: true,
            interaction: {
            intersect: false,
            },
            scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true
            }
            }
        }
    });
};

export async function myChart3() {
    // Call the async function to fetch data
    const chartData = await getCO2RoomInfo();
    console.log(Object.keys(chartData));
    // Create arrays of labels and values from the chartData object
    const labels = Object.keys(chartData);
    const values = Object.values(chartData);
    // Create the chart with the fetched data
    const myChart1 = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
              {
                label: 'CO2e per Room',
                data: values,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              },
            ],
        },
        options: {
            plugins: {
            title: {
                display: true,
                text: 'Total CO2e per rum [kg|'
            },
            legend: {
                display: false
             }
            },
            responsive: true,
            interaction: {
            intersect: false,
            },
            scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true
            }
            }
        }
    });
};
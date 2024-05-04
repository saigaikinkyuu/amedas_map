// 現在時刻の取得
var currentTime = new Date();
var currentYear = currentTime.getFullYear();
var currentMonth = ('0' + (currentTime.getMonth() + 1)).slice(-2);
var currentDay = ('0' + currentTime.getDate()).slice(-2);

// データを格納する配列
var datasets = [];

// 過去24時間分のJSONファイルからデータを取得する
for (var i = 0; i < 24; i++) {
    var hour = ('0' + i).slice(-2); // 時間を2桁にする

    // 地点名（特定の地点番号）をURLから取得
    var hash = window.location.hash;
    var pointNumber = hash.substring(1);

    // ファイルパスを構築
    var filePath = "https://www.jma.go.jp/bosai/amedas/data/map/" + currentYear + currentMonth + currentDay + hour + "0000.json";

    // 各JSONファイルからデータを取得する
    $.getJSON(filePath, function(data) {
        // 特定の地点の温度データのみを抽出
        var temperatureData = data[pointNumber].temp[0];

        // データセットを追加する
        datasets.push(temperatureData);

        // 全てのデータを取得したら、グラフを描画する
        if (datasets.length === 24) {
            drawChart(datasets);
        }
    });
}

// グラフを描画する関数
function drawChart(datasets) {
    // グラフ用のデータを準備する
    var labels = []; // X軸のラベル
    for (var k = 0; k < 24; k++) {
        labels.push(k + ':00'); // 時間をX軸のラベルとして追加
    }

    // グラフを描画する
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line', // 折れ線グラフを指定
        data: {
            labels: labels, // X軸のラベル
            datasets: [{
                label: '温度', // ラベル
                data: datasets, // Y軸の値
                backgroundColor: 'rgba(255, 99, 132, 0.2)', // 塗りつぶし色
                borderColor: 'rgba(255, 99, 132, 1)', // 線の色
                borderWidth: 1 // 線の幅
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true // Y軸を0から始める
                }
            }
        }
    });
}

//2024.05.04 13:37
// 現在時刻の取得
var currentTime = new Date();
var currentHour = currentTime.getHours();
var currentYear = currentTime.getFullYear();
var currentMonth = ('0' + (currentTime.getMonth() + 1)).slice(-2);
var currentDay = ('0' + currentTime.getDate()).slice(-2);

// データを格納する配列
var datasets = [];
var n = 0
var hour = 0
// 過去12時間分のJSONファイルからデータを取得する
for (var i = currentHour - 23; n < 24; i++) {
    n++
    // 時刻が負になる場合、前日の時間に設定
    if (i < 0) {
        i += 24;
        currentDay -= 1;
        if (currentDay === 0) {
            currentMonth -= 1;
            if (currentMonth === 0) {
                currentYear -= 1;
                currentMonth = 12;
            }
            // 月の日数を考慮して日付を調整
            currentDay = new Date(currentYear, currentMonth, 0).getDate();
        }
        hour = i
    }else if(i >= 24){
        currentDay = ('0' + currentTime.getDate()).slice(-2);
        hour = i-24
    }else {
        hour = i
    }

    // 地点名（特定の地点番号）をURLから取得
    var hash = window.location.hash;
    var pointNumber = hash.substring(1);

    // ファイルパスを構築
    var filePath = "https://www.jma.go.jp/bosai/amedas/data/map/" + currentYear + currentMonth + ("0"+currentDay).slice(-2) + ("0" + hour).slice(-2) + "0000.json";

    // 各JSONファイルからデータを取得する
    $.getJSON(filePath, function(data) {
        // 特定の地点の温度データのみを抽出
        var temperatureData = data[pointNumber].temp[0];

        // データセットを追加する
        datasets.push(temperatureData);

        // 全てのデータを取得したら、グラフを描画する
        if (datasets.length === 23) {
            drawChart(datasets);
        }
    });
}

// グラフを描画する関数
function drawChart(datasets) {
    // グラフ用のデータを準備する
    var labels = []; // X軸のラベル
    for (var k = currentHour - 23; k <= currentHour; k++) {
        // 時刻が負になる場合、24時間を加算して正の値にする
        var hour = k < 0 ? k + 24 : k;
        labels.push(hour + ':00'); // 時間をX軸のラベルとして追加
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
                    min: -20,
                    max: 40
                }
            }
        }
    });
}
function content(){
    $.getJSON("https://www.jma.go.jp/bosai/amedas/const/amedastable.json", function (data) {
        var hash = window.location.hash;
        var pointNumber = hash.substring(1);
        var namekj = data[pointNumber].kjName
        var namekn = data[pointNumber].knName
        document.getElementById("name").innerHTML = namekj + "(" + namekn + ")";
        var currentTime = new Date();
        var currentMin = ('0' + currentTime.getMinutes()).slice(-2);
        var currentHour = currentTime.getHours();
        var currentYear = currentTime.getFullYear();
        var currentMonth = ('0' + (currentTime.getMonth() + 1)).slice(-2);
        var currentDay = ('0' + currentTime.getDate()).slice(-2);
        var min = 0
        if(currentMin.slice(0,1) === 0 || currentMin.slice(1,2) <= 5){
            currentHour -= 1
            min = 5
            if(currentHour < 0){
                currentHour += 23
                currentDay -= 1
                if(currentDay <= 0){
                    currentMonth -= 1
                    currentDay = new Date(currentYear, currentMonth, 0).getDate();
                    if(currentMonth <= 0){
                        currentMonth += 12
                        currentYear -= 1
                    }
                }
            }
        }else {
            min = currentMin.slice(0,1)
        }
        $.getJSON("https://www.jma.go.jp/bosai/amedas/data/map/" + currentYear + currentMonth + ("0"+currentDay).slice(-2) + ("0" + hour).slice(-2) + "" + min + "000.json", function (datas) {
            var temp = datas[pointNumber].temp[0]
            if(temp.includes('.') === true){
                var tempResult = ("0" + temp).slice(-4)
            }else{
                if(temp.length === 1){
                    temp = "0" + temp + ".0"
                }else {
                    temp = temp + ".0"
                }
            }
            document.getElementById("temp").innerHTML = ("0" + hour).slice(-2) + "時" + min + "0分時点　" + temp + "℃"
        })
    })
}

content()

var map;

function mapDraw(num) {
    map = L.map('map', {
        zoomControl: false,
        minZoom: 7, // 最低ズームレベルを4に設定
        maxZoom: 9 // 最大ズームレベルを7に設定
    });

    var initialLatLng = L.latLng("35.39", "139.44");
    map.setView(initialLatLng, 7);

    L.control.scale({
        maxWidth: 150,
        position: 'bottomright',
        imperial: false
    }).addTo(map);

    // GeoJSON データを読み込んで地図に追加
    $.getJSON("./prefectures.geojson", function (data) {
        L.geoJson(data, {
            style: {
                "color": "#ffffff",
                "weight": 1.5,
                "opacity": 1,
                "fillColor": "#3a3a3a",
                "fillOpacity": 1
            }
        }).addTo(map);
        
        var currentTime = new Date();
        var currentMin = ('0' + currentTime.getMinutes()).slice(-2);
        var currentHour = currentTime.getHours();
        var currentYear = currentTime.getFullYear();
        var currentMonth = ('0' + (currentTime.getMonth() + 1)).slice(-2);
        var currentDay = ('0' + currentTime.getDate()).slice(-2);
        var min = 0
        if(currentMin.slice(0,1) === 0 || currentMin.slice(1,2) <= 5){
            currentHour -= 1
            min = currentMin.slice(0,1)-1
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

        // AMeDAS データを読み込み、円を追加
        $.getJSON("https://www.jma.go.jp/bosai/amedas/data/map/" + new Date().getFullYear() + ("0" + (new Date().getMonth() + 1)).slice(-2) + ("0" + new Date().getDate()).slice(-2) + ("0" + new Date().getHours()).slice(-2) + "0000.json", function (datas) {
            $.getJSON("https://www.jma.go.jp/bosai/amedas/const/amedastable.json", function (data) {
                function formatDate(date) {
                    var year = date.getFullYear();
                    var month = ('0' + (date.getMonth() + 1)).slice(-2);
                    var day = ('0' + date.getDate()).slice(-2);
                    var hours = ('0' + date.getHours()).slice(-2);
                    var minutes = ('0' + date.getMinutes()).slice(-2);
                    var seconds = ('0' + date.getSeconds()).slice(-2);
                    return year + '/' + month + '/' + day + ' ' + hours + ':' + minutes + ':' + seconds;
                }
                for (var key in datas) {
                    function dmsToDd(degrees, minutes, seconds, direction) {
                        var dd = degrees + minutes / 60 + seconds / (60 * 60);
                        if (direction == "S" || direction == "W") {
                            dd = dd * -1;
                        }
                        return dd;
                    }
                    var markerData = datas[key];
                    markerData.url = 'https://amedas.jkisyou.com/graph.html#' + key;

                    var latitude = dmsToDd(data[key].lat[0], (data[key].lat[1] + "0").slice(0, 2), (data[key].lat[1] + "0").slice(2), "N");
                    var longitude = dmsToDd(data[key].lon[0], (data[key].lon[1] + "0").slice(0, 2), (data[key].lon[1] + "0").slice(2), "E");

                    if (datas[key].temp) {
                        if (datas[key].temp[0] <= 0) {
                            var color = "blue"
                            var rgba = "rgba(0,0,255,0.3)"
                        } else if (datas[key].temp[0] <= 10) {
                            var color = "yellow"
                            var rgba = "rgba(255,255,0,0.3)"
                        } else if (datas[key].temp[0] <= 20) {
                            var color = "orange"
                            var rgba = "rgba(255,165,0,0.3)"
                        } else if (datas[key].temp[0] <= 30) {
                            var color = "red"
                            var rgba = "rgba(255,0,0,0.3)"
                        } else {
                            var color = "purple"
                            var rgba = "rgba(170,0,199,0.3)"
                        }
                        var markerL = new L.LatLng(latitude, longitude);
                        var marker = L.circleMarker(markerL, {
                            radius: 6,
                            color: color,
                            fillColor: rgba,
                            fillOpacity: 1
                        }).addTo(map);
                        // 地図にマーカーを追加
                        marker.bindPopup("<div style='text-align: center;'>"+data[key].kjName + "(" + data[key].knName + ")<br>" + datas[key].temp[0]+"℃</div>", {
                            closeButton: false,
                            zIndexOffset: 10000,
                            maxWidth: 10000
                        });
                        marker.on('mouseover', function (e) {
                            this.openPopup();
                        });
                        marker.on('mouseout', function (e) {
                            this.closePopup();
                        });
                        var url = "https://amedas.jkisyou.com/graph.html#" + key
                        // マーカーをクリックした際の処理
                        marker.on('click', (function(url) {
                            return function(e) {
                                document.getElementById("chart").style.display = "block"
                                document.getElementById("site_chart").src = url
                            };
                        })(url));
                    }
                }
            });
        });
    });
}

function changeMap(i) {
    map.remove();
    mapDraw(i);
}

function start() {
    mapDraw("None");
}

start();

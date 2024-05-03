var map
function mapDraw(num){
map = L.map('map', {
    zoomControl: false
})
L.control.scale({ maxWidth: 150, position: 'bottomright', imperial: false }).addTo(map);

var PolygonLayer_Style_nerv = {
    "color": "#ffffff",
    "weight": 1.5,
    "opacity": 1,
    "fillColor": "#3a3a3a",
    "fillOpacity": 1
}

$.getJSON("./prefectures.geojson", function (data) {
    L.geoJson(data, {
        style: PolygonLayer_Style_nerv
    }).addTo(map);
});
$.getJSON("https://www.jma.go.jp/bosai/amedas/data/map/"+new Date().getFullYear()+""+("0"+(new Date().getMonth()+1)).slice(-2)+""+("0"+new Date().getDate()).slice(-2)+""+("0"+new Date().getHours()).slice(-2)+""+(new Date().getMinutes()+"0").slice(0,1)+"000.json", function (datas) {
    $.getJSON("https://www.jma.go.jp/bosai/amedas/const/amedastable.json", function (data) {
    function formatDate(date) {
      var year = date.getFullYear();
      var month = ('0' + (date.getMonth() + 1)).slice(-2); // 月を2桁にする
      var day = ('0' + date.getDate()).slice(-2); // 日を2桁にする
      var hours = ('0' + date.getHours()).slice(-2); // 時を2桁にする
      var minutes = ('0' + date.getMinutes()).slice(-2); // 分を2桁にする
      var seconds = ('0' + date.getSeconds()).slice(-2); // 秒を2桁にする
      return year + '/' + month + '/' + day + ' ' + hours + ':' + minutes + ':' + seconds;
    }
      for (var key in datas) {
        function dmsToDd(degrees, minutes, seconds, direction) {
          var dd = degrees + minutes/60 + seconds/(60*60);
          if (direction == "S" || direction == "W") {
            dd = dd * -1;
          } // Don't do anything for N or E
          return dd;
        }

        // 座標を度分秒形式から度数形式に変換
        var latitude = dmsToDd(data[key].lat[0], (data[key].lat[1]+"0").slice(0,2), (data[key].lat[1]+"0").slice(2), "N");
        var longitude = dmsToDd(data[key].lon[0], (data[key].lon[1]+"0").slice(0,2), (data[key].lon[1]+"0").slice(2), "E");

        if(datas[i].temp[0] >= 0){
          var color = "blue"
          var rgba = "rgba(0,0,255,0.3)"
        }else if(datas[i].temp[0] >= 10){
          var color = "yellow"
          var rgba = "rgba(255,255,0,0.3)"
        }else if(datas[i].temp[0] >= 20){
          var color = "orange"
          var rgba = "rgba(255,165,0,0.3)"
        }else if(datas[i].temp[0] >= 30){
          var color = "red"
          var rgba = "rgba(255,0,0,0.3)"
        }else {
          var color = "purple"
          var rgba = "rgba(170,0,199,0.3)"
        }
        var markerL = new L.LatLng(latitude, longitude);
        var markerIcon = L.circleMarker({
          radius: 10, // 半径を設定
          color: color, // 外側の色を赤に設定
          fillColor: rgba, // 中心の色を透明な赤に設定
          fillOpacity: 1 // 塗りつぶしの透明度を設定
        });
        var marker = L.marker(markerL, { icon: markerIcon }).addTo(map);
        // 地図にマーカーを追加
        marker.addTo(map);
        marker.bindPopup(pref.Name+city.Name,{closeButton: false, zIndexOffset: 10000, maxWidth: 10000})
        marker.bindPopup(data[key].kjName + "(" + data[key].knName + ")",{closeButton: false, zIndexOffset: 10000, maxWidth: 10000});
        marker.on('mouseover', function (e) {this.openPopup();});
        marker.on('mouseout', function (e) {this.closePopup();});
      }
});
    
})
}
function chengeMap(i){
    map.remove();
    mapDraw(i)
}
function start(){
    mapDraw("None")
}
start()

//모든검색결과를 쪼그만한 점으로 찍기 ... -> 모든 검색결과는 완료, 마커는 이미지를 만들어야함
//
//http://apis.map.daum.net/web/sample/multipleMarkerControl/
// 마커 제어하기...내 위치마커만 따로 트랙킹해주던가 아니면 전부다 업데이트...
// 없애진말자..마커하나다는데 그렇게 메모리 차지하지는 않는듯 마커가 쌓이는건 쫌 에반듯 -> 그냥 싹다 갈아업는걸로
//마커당 클릭리스너달기? -> 핸드폰에서는 클릭리스너를 달아야 할 -> 완료

//http://apis.map.daum.net/web/sample/customOverlay2/
//커스텀 오버레이...구현하기 빡셀듯?

//http://apis.map.daum.net/web/sample/keywordBasic/
//키워드로 장소검색을 해서 불러오는게 쫌 나을듯 만약 겹치는게있다면...
//안된다.. 장소검색하거나,, 장소 + 브랜드매장으로 검색을 해야만 하네... 브랜드매장으로만하면 전국에서 찾아버림
//미리 인포윈도우로 알려줘야하나.. ->내자리검색 또는 주소로 검색만 구현해야할듯 -> 완료

//api키 보관은 어떻게 할것인가... -> 대충해결한듯! ->다시 미궁으로...서버에서 제이슨형태든 불러와야할듯 api키노출됌

//이제 음...백앤드에서 디비작업해야할듯, 이미지는 따른 서버에 저장을 하고 url을 불러오는 형식이 적합할듯

const myLocCafes_API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/post/myLocCafes' : 'http://172.30.1.50:5000/post/myLocCafes'
const myMapCafes_API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/post/myMapCafes' : 'http://172.30.1.50:5000/post/myMapCafes'
const google_API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api/google' : 'http://172.30.1.50:5000/api/google'
const mapContainer = document.getElementById('map');
const form = document.querySelector('form')

daum.maps.disableHD();

var myLocation = {
    lat : 0,
    lng : 0
}

var map_rect = {
    leftCoord : {}, 
    rightCoord : {}
}

var mapOption = {}
var cafeData = []
var markers = []
var map;
var ps;

getLocation()  //처음 페이지로딩됐을때 내가 있는곳 지도에 표시하기 (localhost or https)
// getLoc() //핸드폰이나 http로 들어갈때 여기로

//Add map dragend, zoom changed event -> updated map_rect, map_level , 움직였을때 카페찾기
function addMapChangedEvent() {
    daum.maps.event.addListener(map, 'dragend', function() {        
        var bounds = map.getBounds();
        var swLatlng = bounds.getSouthWest();
        var neLatlng = bounds.getNorthEast();
        leftLng = swLatlng.ib
        leftLat = swLatlng.jb
        rightLng = neLatlng.ib
        rightLat = neLatlng.jb
        map_rect.leftCoord = {leftLng, leftLat}
        map_rect.rightCoord = {rightLng, rightLat}
        console.log('dragend listener', map_rect)   
        getCafesMyMap()
    });

    daum.maps.event.addListener(map, 'zoom_changed', function() {  
        var level = map.getLevel()
        mapOption.level = level// level updated          
        var bounds = map.getBounds();
        var swLatlng = bounds.getSouthWest();
        var neLatlng = bounds.getNorthEast();
        leftLng = swLatlng.ib
        leftLat = swLatlng.jb
        rightLng = neLatlng.ib
        rightLat = neLatlng.jb
        map_rect.leftCoord = {leftLng, leftLat}
        map_rect.rightCoord = {rightLng, rightLat} 
        console.log('zoom_changed Listener', map_rect)
        getCafesMyMap()
    });
}


//웹브라우저에게 내 위치 gps 요청 , https 가 허용될때
function getLocation() {
    if (navigator.geolocation) { // GPS를 지원하면
        navigator.geolocation.getCurrentPosition(function(position) {
            // alert(position.coords.latitude + ' ' + position.coords.longitude);
            lat = position.coords.latitude
            lng = position.coords.longitude
            myLocation.lat = position.coords.latitude
            myLocation.lng = position.coords.longitude
            drawMap(lat, lng) // 위치따온걸로 맵그리기
        }, function(error) {
            console.error(error);
        }, {
            enableHighAccuracy: false,
            maximumAge: 0,
            timeout: Infinity
        })} else {
        alert('GPS를 지원하지 않습니다');
    }
    console.log('getLoaction function', myLocation)
}

//google api로 요청 오차가 큼.. -> 핸드폰
function getLoc(){
    console.log("getLoc")
    fetch(google_API_URL)
    .then(response => response.json())
    .then(datas => {
        console.log(datas)
        myLocation = datas.location
        drawMap(myLocation.lat, myLocation.lng)
    })
}

//lat, lng받아서 지도에 표시하기 putMarkerOnMyL()호출
function drawMap(lat, lng) {
    mapOption = { 
        center: new daum.maps.LatLng(lat, lng), // 지도의 중심좌표
        level: 4// 지도의 확대 레벨
    };
    map = new daum.maps.Map(mapContainer, mapOption); // 지도를 생성합니다
    map.setCopyrightPosition(daum.maps.CopyrightPosition.BOTTOMRIGHT, true);
    addMapChangedEvent() // 맵의 drag이벤트 or zoomchanged 끝났을때 이벤트리스너 등록 동작
    formEventListner()

    var bounds = map.getBounds();
    var swLatlng = bounds.getSouthWest();
    var neLatlng = bounds.getNorthEast();
    leftLng = swLatlng.ib
    leftLat = swLatlng.jb
    rightLng = neLatlng.ib
    rightLat = neLatlng.jb
    map_rect.leftCoord = {leftLng, leftLat}
    map_rect.rightCoord = {rightLng, rightLat}
    console.log('drawMap', myLocation)

    putMarkerOnMyL()
}

function putMarkerOnMyL() {

    map.setCenter(new daum.maps.LatLng(myLocation.lat, myLocation.lng))
    
    var markerPosition  = new daum.maps.LatLng(myLocation.lat, myLocation.lng); 
    var marker = new daum.maps.Marker({
        position: markerPosition
    });
    marker.setMap(map);
    console.log('putMarkerOnMyL', myLocation)
}

function clearMarkers() {
    markers.forEach(marker => {
        marker.setMap(null)
    })
    markers = []
}

//cafeData에 있는 카페들을 지도에 표시해줌
function putMarkers_byMyLoc(){
    clearMarkers()
    map.setLevel(3)
    map.setCenter(new daum.maps.LatLng(myLocation.lat, myLocation.lng))
    
    var positions = []
    for (let i =0; i < cafeData.length; i++) {
        positions.push({
            title: cafeData[i].place_name,
            latlng: new daum.maps.LatLng(cafeData[i].lat, cafeData[i].lng)
        })
    }
    // 마커 이미지의 이미지 주소입니다
    var imageSrc = "http://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"; 
    
    for (var i = 0; i < positions.length; i ++) {
    
        // 마커 이미지의 이미지 크기 입니다
        var imageSize = new daum.maps.Size(24, 35); 
        
        // 마커 이미지를 생성합니다    
        var markerImage = new daum.maps.MarkerImage(imageSrc, imageSize); 
        
        //정보를 줘서 마커생성하고 이미지 전달해주는 함수, 그리고 클릭리스너도 해줌
        addOverlay(positions[i], markerImage)   
    }
    console.log('putMarkers_byMyLoc')
    // console.log('cafeData', cafeData)
    // console.log('positions', positions)
}

//api 요청으로 내 위치에서 반경으로 검색되는 커피매장 찾고 putMarkers_byMyLoc 호출
function getCafesMyLoc(){
    console.log("getCafesMyArea function")
    cafeData = [] // 초기화, 아니면 set 으로 둘수도?

    fetch(myLocCafes_API_URL, {
        method: 'POST',
        body: JSON.stringify(myLocation),
        headers: { 'content-type':'application/json' }
    })
    .then(response => response.json())
    .then(datas => {
        datas.forEach(data => {
            // console.log(data.place_name)
            // console.log(data.x)
            // console.log(data.y)
            cafeData.push({
                place_name : data.place_name,
                lng : data.x,
                lat : data.y,
                id : data.id
            })        
        })  
        console.log('cafedata', cafeData)
        putMarkers_byMyLoc();
    })
}

function putMarkers_byMyMap() {
    clearMarkers()
    var positions = []
    for (let i =0; i < cafeData.length; i++) {
        positions.push({
            title: cafeData[i].place_name,
            latlng: new daum.maps.LatLng(cafeData[i].lat, cafeData[i].lng)
        })
    }
    // 마커 이미지의 이미지 주소입니다
    var imageSrc = "http://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"; 
    
    for (var i = 0; i < positions.length; i ++) {
    
        // 마커 이미지의 이미지 크기 입니다
        var imageSize = new daum.maps.Size(24, 35); 
        
        // 마커 이미지를 생성합니다    
        var markerImage = new daum.maps.MarkerImage(imageSrc, imageSize); 
        
        //정보를 줘서 마커생성하고 이미지 전달해주는 함수, 그리고 클릭리스너도 해줌
        addOverlay(positions[i], markerImage)
        }
    console.log('putMarkers_byMyMap')
    // console.log('cafeData', cafeData)
    // console.log('positions', positions)
}

//현재 지도에서 카페를 찾고 putMarkers_byMyMap호출
function getCafesMyMap() {
    console.log("getCafesMyMap function")
    // console.log(map_rect)

    cafeData = []
    fetch(myMapCafes_API_URL, {
        method: 'POST',
        body: JSON.stringify(map_rect),
        headers: { 'content-type':'application/json' }
    })
    .then(response => response.json())
    .then(datas => {
        datas.forEach(data=>{
            cafeData.push({
                place_name: data.place_name,
                lng: data.x,
                lat: data.y,
                id : data.id
            })
        })
        console.log('cafedata', cafeData)
        putMarkers_byMyMap()
    })
}

//form 태그에 이벤트리스너 달기...
function formEventListner() {
    form.addEventListener('submit', (event)=>{
        event.preventDefault()
        const formData = new FormData(form)
        const keyword = formData.get('keyword')
        keywordSearch(keyword)
    })
}

//키워드로 (장소?) 로 검색후, 그 지도에서 getCafesMyMap 호출
function keywordSearch(keyword){
    // 장소 검색 객체를 생성합니다
    ps = new daum.maps.services.Places()
    console.log("ps", ps)

    // 키워드로 장소를 검색합니다
    ps.keywordSearch(keyword, placesSearchCB); 

    // 키워드 검색 완료 시 호출되는 콜백함수 입니다
    function placesSearchCB (data, status, pagination) {
        if (status === daum.maps.services.Status.OK) {

            // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
            // LatLngBounds 객체에 좌표를 추가합니다
            var bounds = new daum.maps.LatLngBounds();
            for (var i=0; i<data.length; i++) {
                bounds.extend(new daum.maps.LatLng(data[i].y, data[i].x));
            }       
            // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
            map.setBounds(bounds);
            getCafesMyMap()  // 가끔 안될때가 있네...
        }
    }
}

function clickSelect(latlng){
    let smallest = 10
    let idx = 0
    for(var i = 0; i < cafeData.length; i++){
        diff = Math.abs(Number(cafeData[i].lat) - Number(latlng.jb)) + Math.abs(Number(cafeData[i].lng) - Number(latlng.ib))
        // console.log(cafeData[i].place_name, cafeData[i].lat, cafeData[i].lng)
        // console.log('latlng', latlng.jb, latlng.ib)
        // console.log(diff)
        if (smallest > diff){
            smallest = diff
            idx = i
        }
    }
    console.log(cafeData[idx].place_name)
    console.log(cafeData[idx].id)
}

function addOverlay(position, markerImage) {
    var marker = new daum.maps.Marker({
        map: map, // 마커를 표시할 지도
        position: position.latlng, // 마커를 표시할 위치
        title : position.title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
        image : markerImage // 마커 이미지 
    });   

    daum.maps.event.addListener(marker, 'click', function() {
        console.log('its clicked')
        console.log(marker.getPosition())
        clickSelect(marker.getPosition()) 
    });
    markers.push(marker)
}
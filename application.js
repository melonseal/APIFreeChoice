var countryName = "";

$(document).ready(function(){
    basicMap();
    getNyTimesGeneral();
    //$('#map').slideToggle();
    $('#center').animate({opacity: '1'}, 'slow');
    $('#genClimateData').on('click', function(){
        console.log('click successful');
        var type = $('#type').val();
        var variable = $('#var').val();
        var times = $('#time').val();
        var countryCode = $('#country').val();
        $.ajax({
            url: 'http://climatedataapi.worldbank.org/climateweb/rest/v1/country/' + type + '/gfdl_cm2_1/' +
            variable + '/' + times.substring(0,4) + '/' + times.substring(4) + '/' + countryCode.substring(0,3),
            type: 'GET',
            crossDomain: true,
            dataType: 'json',
            success: function(result) {
                console.log(result);
                buildClimateResultTable(result, type);
            },
            error: function() { alert('Failed!'); }
        });
    });

    $.ajax({
        url: 'https://restcountries.eu/rest/v2/all',
        type: 'GET',
        crossDomain: true,
        dataType: 'json',
        success: function(result) {
            console.log(result);
            buildCountrySelector(result);
        },
        error: function() { alert('Failed!'); }
    });


    /* my api key:
     * AIzaSyAdSM2oRMcs2xfjcSwu5WaUmOr5T66cEVE
     */

    $('#getClimate').on('click', function(){

        $('#climateForm').slideToggle();
    });


});

function buildCountrySelector(allCountries){
    var result = "";
    for(var i = 0; i < allCountries.length; i++){
        result += "<option value=" + allCountries[i].alpha3Code + allCountries[i].name + ">" + allCountries[i].name + "</option>\n";
    }
    $('#country').append(result);
}

function buildClimateResultTable(climateData, type){
    console.log("selected option=" + $(":selected"));
    $.ajax({
        url: 'https://restcountries.eu/rest/v2/all',
        type: 'GET',
        crossDomain: true,
        dataType: 'json',
        success: function(result) {
            console.log(result);
            buildMap(result);
        },
        error: function() { alert('Failed!'); }
    });
    countryName = $('#country').val();
    console.log($('#country').val());
    console.log(countryName);
    var precipOrTemp = climateData[0].variable;
    if(precipOrTemp.length < 3){
        precipOrTemp = 'Precipitation (cm)';
    }else{
        precipOrTemp = 'Temperature (celsius)';
    }
    var result = "<table id='climateDatas'> <tr><caption>" + precipOrTemp + " Data in " + countryName.substring(3) +  " from " + climateData[0].fromYear + " to " + climateData[0].toYear +
        "<br>This data taken from the NOAA climate model 2.1</caption>";
    var secondArray = "";
    if(type.length < 5){
        secondArray = climateData[0].monthVals;
        result += "<th>January Average</th> <th>February Average</th> <th>March Average</th><th>April Average</th>"
            + "<th>May Average</th><th>June Average</th></tr>";
    }else{
        secondArray = climateData[0].annualData;
        result += "<td>Annual Average</td></tr>"
    }
    console.log(secondArray);
    console.log(secondArray[0]);
    for(var i = 0; i < secondArray.length; i++){
        if(i % 6 === 0 && i !== 0){
            result += "</tr><tr> <th>July Average</th> <th>August Average</th>"
            + "<th>September Average</th><th>October Average</th> <th>November Average</th> <th>December Average</th> </tr><tr>";
        }
        var n = secondArray[i].toFixed(2);
        result += '<td>' + n + '</td>';
    }
    result += "</tr></table> <br>";
    console.log(result);
    $('#climateDisplay').empty();
    $('#climateDisplay').append(result);
    //$('#map').slideToggle();

    getNyTimesCountry(countryName.substring(3));


}

function nyTimes(url){
    $.ajax({
        url: url,
        type: 'GET',
        crossDomain: true,
        dataType: 'json',
        success: function(result) {
            console.log(result);
            setUpArticleTable(result);
        },
        error: function() { alert('Failed!'); }
    });
}

function getNyTimesGeneral(){
    var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
    url += '?' + $.param({
        'api-key': "c6de1aa1485c47879b0e29bd26f6c45c",
        'q': '"global warming"'
    });
    nyTimes(url);
}

function setUpArticleTable(articleArray){
    var result = "<table><tr><th>Title & Link</th><th>Author</th></tr>";
    var author = "";

    for(var i = 0; i < articleArray.response.docs.length; i++){
        if(articleArray.response.docs[i].document_type === "article"){
            if(articleArray.response.docs[i].byline.original === null){
                author = "--";
            }else{
                author = articleArray.response.docs[i].byline.original;
            }
            result += "<tr><td><a href='" + articleArray.response.docs[i].web_url + "'>" +
                articleArray.response.docs[i].headline.main + "</a></td><td>" + author
                + "</td></tr>";
        }
    }
    result += "</table><br>";

    $('#countryArticles').prepend(result);

    //table idea: column for link, article title, author, date
}

function getNyTimesCountry(name){
    var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
    url += '?' + $.param({
        'api-key': "c6de1aa1485c47879b0e29bd26f6c45c",
        'q': '"global warming"' + name
    });
    nyTimes(url);
}

function basicMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 1,
        center: {lat:0, lng:0}
    });
}

function buildMap(countries) {
    $('#map').empty();
    var alphaCode = $('#country').val();
    var lati = 0;
    var long = 0;
    for(var i = 0; i < countries.length; i++){
        if(countries[i].alpha3Code === alphaCode.substring(0,3)){
            lati += countries[i].latlng[0];
            long += countries[i].latlng[1];
        }
    }
    var location = {lat:lati, lng: long};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: location
    });

    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
    $('#map').slideDown();
}
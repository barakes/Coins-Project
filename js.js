let arr_coins = []; //contient object to local storage - more info
let arr_list = []; // contient inputs from checkbox
let dataPoints = [];
let chart = null;
let data_lines = null;
let timer = null;

$(document).ready(function () {
  $("#home").on("click", function () { //main page
    $(".home").html("<img id='large_gif' src='images/gif.gif'>");
    $(".about").css("display","none");
    $(".reports").css("display","none");
    if (timer !== null) {
      clearTimeout(timer);
    }
    getAllCoins();
  });

  $("#reports").on("click", function () { //chart page
    $(".home").html("<img id='large_gif' src='images/gif.gif'>");
    $(".about").css("display","none");
    $(".reports").css("display","block");
    $(".form-search").css("display","none");
    if (arr_list.length > 0) {
      clearTimeout(timer);
      dataPoints = [];
      dataLines = [];
      chart = null;
      data_lines = null;
      timer = null;
      chartCoin();
    } else {
      alert("Please select coins to compare");
      clearTimeout(timer);
      getAllCoins()  
    }
  });
  $("#about").on("click", function () { //about page
    $(".home").html("<img id='large_gif' src='images/gif.gif'>");
    $(".reports").css("display", "none");
    $(".form-search").css("display","none");
    if (timer !== null) {
      clearTimeout(timer);
    }
    aboutMe();
  });
});

function getAllCoins() {//bring all coins
  $.ajax({
    url: "https://api.coingecko.com/api/v3/coins/list",
    type: "get",
    data: {},
    success: function (result) {
      searchAndPrintCoins($(result).splice(0, 100));
    },
    error: function (xhr) {
      console.log("Error:", xhr);
    }
  });
}

function searchAndPrintCoins(result){
  $(".home").html("");
  let search_val = $("#search_inp").val();
  $(".home").css("display", "block");
  $(".form-search").css("display","block");
  $("#sub_btn").on("click", function(){ //search coin
    for (let i = 0 ; i < result.length ; i++){
      let coin_id = result[i].id;
      let coin_symbol = result[i].symbol;
      if (result[i].symbol.toUpperCase() == search_val){
        $(".home").html("");
        $(".home").css("display", "block");
        printCoins(coin_id, coin_symbol); 
      }
    }
  });
  for (let i = 0 ; i < result.length ; i++){ //bring all coins
    let coin_id = result[i].id;
    let coin_symbol = result[i].symbol;
    printCoins(coin_id, coin_symbol);
  }
}

function printCoins(coin_id, coin_symbol) { //print coins (by search or url)
  let card = $("<div class='card " + coin_id + "'></div>");
  let input_switch = $("<label id='" + coin_symbol + "' name='" + coin_id + "' class='switch checked'><input value='checkbox' type='checkbox' class='class-" + coin_id + "'><span class='slider round'></span></label>");
  let div_info = $("<div id='info_" + coin_id + "' class='div-info collapse'></div>");
  let btn = $("<div class='btn-footer1 card-footer'><button type='button' class='btn btn-dark info '> More Info </button></div>");
  
  $(btn).attr("id", "btn_" + coin_id);
  $(btn).on("click", function () {
    $("#info_" + coin_id).html("<img id='small_gif' src='images/gif.gif'>");
    moreInfoData(this.id, coin_id);
    $("#info_" + coin_id).collapse("toggle");
  });

  let card_head = $("<div class='text-head1 card-header'>" + coin_symbol.toUpperCase() + "</div>");
  $(card_head).append(input_switch);
  let card_body = $("<div class='text-body1 card-body'>" + coin_id + "</div>");
  $(card).append(card_head);
  $(card).append(card_body);
  $(card).append(btn);
  $(card).append(div_info);
  $(".home").append(card);
  
  createArrList(input_switch, input_switch.children()[0], coin_id, coin_symbol);
}

function moreInfoData(param, coin_id) { // get more info (from storage or url)
  let param_btn = param.split("btn_")[1];

  arr_coins = localStorage.coins_storage ? JSON.parse(localStorage.coins_storage) : [];
    
  if (arr_coins.length > 0 && arr_coins != null) {
    for (let i = 0; i < arr_coins.length; i++) {
      if (arr_coins[i].coins_name == param_btn) {
        if ($.now() - arr_coins[i].btn_clicked < 1000 * 60 * 2) {
          printFromLocal(coin_id, arr_coins[i]);
          return;
        }
        else {
          arr_coins.splice(i, 1);
          localStorage.coins_storage = JSON.stringify(arr_coins);
          printData(coin_id);
          return;
        } 
      } 
    }
    printData(coin_id);
  } else {
    printData(coin_id);
  }
}

function printData(coin_id) { // print more info from url
  $.ajax({
    url: "https://api.coingecko.com/api/v3/coins/" + coin_id,
    type: "get",
    data: {},
    success: function (result) {
      printCollapse(result, coin_id);
    },
    error: function (xhr) {
      console.log("Error:", xhr);
    }
  });
}

function printCollapse(result, coin_id) {
  $("#info_" + coin_id).html("");
  console.log(result);
  let id_storage = result.id;
  let img_storage = result.image.small;
  let usd_storage = result.market_data.current_price.usd;
  let eur_storage = result.market_data.current_price.eur;
  let ils_storage = result.market_data.current_price.ils;

  let coin_img = $("<img src='" + result.image.small + "'>");
  let coin_usd = $("<div>USD: " + result.market_data.current_price.usd.toFixed(4) + "$</div>");
  let coin_eur = $("<div>EUR: " + result.market_data.current_price.eur.toFixed(4) + "€</div>");
  let coin_ils = $("<div>ILS: " + result.market_data.current_price.ils.toFixed(4) + "₪</div>");

  let obj_coins = {
    btn_clicked: Date.now(),
    coins_name: id_storage,
    coins_img: img_storage,
    coins_usd: usd_storage,
    coins_eur: eur_storage,
    coins_ils: ils_storage
  };

  let div_from = $("<div>FROM URL</div>");

  $("#info_" + coin_id).append(div_from);

  $("#info_" + coin_id).css("margin-left", "10px");
  $("#info_" + coin_id).append(coin_img);
  $("#info_" + coin_id).append(coin_usd);
  $("#info_" + coin_id).append(coin_eur);
  $("#info_" + coin_id).append(coin_ils);

  createLocal(obj_coins, coin_id);
}

function createLocal(obj_coins, coin_id) { //create local storage to "more info"
  arr_coins = localStorage.coins_storage ? JSON.parse(localStorage.coins_storage) : [];
  if (0 <= arr_coins.findIndex(function (obj_coins) {
    return obj_coins.coins_name == coin_id;
  })
  ) {
    console.log(obj_coins.coins_name);
  } else {
    arr_coins.push(obj_coins);
    // localStorage.coins_storage = JSON.stringify(arr_coins);
  }
  localStorage.coins_storage = JSON.stringify(arr_coins);
}

function printFromLocal(coin_id, index) { //print more-info from local storage
  $("#info_" + coin_id).html("");
  arr_coins = localStorage.coins_storage ? JSON.parse(localStorage.coins_storage) : [];
 
  let coin_img = $("<img src='" + index.coins_img + "'>");
  let coin_usd = $("<div>USD: " + index.coins_usd.toFixed(4) + "$</div>");
  let coin_eur = $("<div>EUR: " + index.coins_eur.toFixed(4) + "€</div>");
  let coin_ils = $("<div>ILS: " + index.coins_ils.toFixed(4) + "₪</div>");
  let div_from = $("<div>FROM LOCAL</div>");
  
  $("#info_" + coin_id).append(div_from);
  $("#info_" + coin_id).css("margin-left", "10px");
  $("#info_" + coin_id).append(coin_img);
  $("#info_" + coin_id).append(coin_usd);
  $("#info_" + coin_id).append(coin_eur);
  $("#info_" + coin_id).append(coin_ils);
}

function createArrList(input1, input_alone, coin_id, coin_symbol) { //create an array of checks input 
  if (arr_list.length > 0 && arr_list != null) {
    for (let i = 0; i < arr_list.length; i++) {
      if ($(arr_list[i]).attr("class") == $(input_alone).attr("class")) {
        $(".class-" + coin_id).prop("checked", true);
        $(input_alone).attr("checked", true);
        $(input_alone).prop("checked", true);
        $(input_alone).attr("id", coin_symbol);
      }
    }
    $(input1).change(function () {
      let size = arr_list.length;
      let in_array = false;
      for (let i = 0; i < size; i++) {
        if ($(input1).children().attr("class") == $(arr_list[i]).attr("class")) {
          in_array = true;
          arr_list.splice(i, 1);
          $(input_alone).attr("checked", false);
          $(input_alone).prop("checked", false);
          return;
        }
      }

      $(input_alone).attr("checked", true);
      $(input_alone).prop("checked", true);
      $(input_alone).attr("id", coin_symbol);
      arr_list.push(input_alone);
      console.log(arr_list);
      if (arr_list.length > 5) {
        openPopup(coin_id, input_alone);
        console.log("ARR LENGTH = " + arr_list.length);
      }

    });

  } else {
    $(input1).change(function () {
      let test = $(input1).children()[0];
      if (arr_list.includes(input_alone) === false) {
        $(input_alone).attr("checked", true);
        $(input_alone).attr("id", coin_symbol);
        arr_list.push(input_alone);

        console.log(arr_list);
        if (arr_list.length > 5) {
          openPopup(coin_id, input_alone);
        }
      } else {
        for (let i = 0; i < arr_list.length; i++) {
          if (arr_list[i] == input_alone) {
            $(input_alone).attr("checked", false);
            $(input_alone).prop("checked", false);
            arr_list.splice(i, 1);
            console.log(arr_list);
          }
        }
      }
    });
  }
}

function openPopup(coin_id, input_alone) { //if the arr_list greater then 5 open popup
  $("#popup").css("display", "block");
  $(".cover").css("display", "block");

  $("#popup").html("");
  $("#popup").append("<h1>Change Coins</h1>");
  $("#popup").append("<p>(This will replace your choose)</p>");
  let row2 = $("<div class='row'></div>");
  let class_name = "";
  let input_choice = "";
  let last_input_choice = "";
  for (let i = 0; i < arr_list.length - 1; i++) {
    class_name = $(arr_list[i]).prop("class").slice(6);
    let row1 = $("<div class='row'></div>");
    let div1 = $("<div class='col-md-6'></div>");
    let div2 = $("<div class='div2 col-3'></div>");

    $(div1).append($("<div class='choice'>" + class_name + "</div>"));
    input_choice = $("<label class='choice-switch'><input type='checkbox' checked class='choice-" + class_name + "'><span class='slider round'></span></label>");

    $(div2).append(input_choice);

    $(row1).append(div1);
    $(row1).append(div2);

    $("#popup").append(row1);

    $("input:checkbox[class='choice-" + class_name + "']").change(function () {
      last_input_choice = $(this).attr("class").split("choice-")[1];
      removeChoice(last_input_choice, input_alone);
    });
  }
  
  $(row2).append("<button class='no'>Cancel</button>");
  $("#popup").append(row2);

  $(".no").on("click", function () {
    console.log("input.class-" + coin_id);
    arr_list.pop();
    $(input_alone).attr("checked", false);
    $("input.class-" + coin_id).prop("checked", false);
    $("#popup").css("display", "none");
    $(".cover").css("display", "none");
  });
}

function removeChoice(param, input_alone) { //if the user want to switch is choich in the popup
  console.log(param);
  let input_slice = $('input[value="checkbox"]');
  // let input_slice = $("input:checkbox[value='checkbox']"); // input[type="checkbox"]
  console.log(input_slice);
  for (let i = 0; i < input_slice.length; i++) {
    let final_slice = $(input_slice[i]).attr("class");
    final_slice = $(input_slice[i]).attr("class").split("class-")[1];

    console.log(final_slice);
    
    if (final_slice == param) {
      console.log(final_slice);
      console.log(input_alone);
      $(input_alone).attr("checked", true);
      $(input_alone).prop("checked", true);

      $(".class-" + final_slice).attr("checked", false);
      $(".class-" + final_slice).prop("checked", false);

      for (let t = 0; t < arr_list.length; t++) {
        if ($(input_slice[i]).attr("class") == $(arr_list[t]).attr("class")) {
          arr_list.splice(t, 1);
        }
      }

      $("#popup").css("display", "none");
      $(".cover").css("display", "none");
      return;
    }
  }
}

function chartCoin() {
  $(".home").html("");
  console.log($(arr_list[0]).attr("id"));
  let coins_upper_case = "";
  for (let i = 0; i < arr_list.length; i++) {
    coins_upper_case += $(arr_list[i]).attr("id").toUpperCase() + ",";
  }
  coins_upper_case = coins_upper_case.slice(0, -1);
  console.log("ghfdgdf = " + coins_upper_case);
  $.getJSON( "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + coins_upper_case +"&tsyms=USD",
    function (data) {
      $.each(data, function (key, value) {
        if (dataPoints[key]) {
          console.log(dataPoints)
          dataPoints[key].push({
            y: value.USD,
          });
        } else {
          dataPoints[key] = [{
            y: value.USD,
          },];
        }
      });
  
      if (!data_lines) {
        data_lines = [];
        for (let i = 0; i < arr_list.length; i++) {
          data_lines.push({
            type: "line",
            xValueFormatString: "####",
            yValueFormatString: "$#,##0.##",
            showInLegend: true,
            name: $(arr_list[i]).attr("id"),
            dataPoints: [],
          });
          data_lines[i].dataPoints = dataPoints[$(arr_list[i]).attr("id").toUpperCase()];
        }
      } else {
        for (let i = 0; i < arr_list.length; i++) {
          data_lines[i].dataPoints = dataPoints[$(arr_list[i]).attr("id").toUpperCase()];
        }
      }
  
      if (chart) {
        chart.data = data_lines;
        chart.render();
      } else {
        chart = new CanvasJS.Chart("chartContainer", {
          animationEnabled: true,
          zoomEnabled: true,
          theme: "dark2",
          title: {
            text: "Live Chart with dataPoints from External JSON",
          },
          axisX: {
            title: "Time",
            valueFormatString: "00:00",
            interval: 2,
          },
          axisY: {
            logarithmic: true, //change it to false
            title: "Coins Value",
            prefix: "$",
            titleFontColor: "#6D78AD",
            lineColor: "#6D78AD",
            gridThickness: 0,
            lineThickness: 1,
            includeZero: false,
            labelFormatter: addSymbols,
          },
          legend: {
            verticalAlign: "top",
            fontSize: 16,
            dockInsidePlotArea: true,
            cursor: "pointer",
            itemclick: function (e) {
              if (
                typeof e.dataSeries.visible === "undefined" ||
                e.dataSeries.visible
              ) {
                e.dataSeries.visible = false;
              } else {
                e.dataSeries.visible = true;
              }
              e.chart.render();
            },
          },
          data: data_lines,
        });
        chart.render();
      }
    },
  );
  
  timer = setTimeout(function () {
    console.log(dataPoints)
    chartCoin();
  }, 2000);
  
  function addSymbols(e) {
    const suffixes = ["", "K", "M", "B"];
  
    const order = Math.max(Math.floor(Math.log(e.value) / Math.log(1000)), 0);
    if (order > suffixes.length - 1) order = suffixes.length - 1;
  
    const suffix = suffixes[order];
    return CanvasJS.formatNumber(e.value / Math.pow(1000, order)) + suffix;
  }
}

function aboutMe(){ //print page about
  $(".home").css("display", "none");
  $(".about").css("display", "block");
  let h1 = $("<h1>Real Madrid</h1>");
  let img = $("<img class='madrid' src='images/real-madrid.gif'>");
  let p = $(`<div><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam convallis sem sed tellus aliquet, quis aliquam mi hendrerit. Vestibulum in sollicitudin massa. Aliquam augue dui, consectetur eget gravida at, blandit sed felis. Suspendisse consequat risus sed justo ultrices feugiat. Donec a volutpat urna. Fusce rutrum vel sem non laoreet. Aliquam lacinia erat eu odio posuere, vel laoreet tortor rhoncus. Vestibulum nibh ipsum, accumsan non dui vel, ultricies faucibus nunc. Maecenas venenatis dolor at rutrum iaculis.
  Vivamus sollicitudin fermentum est non eleifend. Nam bibendum, nibh non tempus aliquam, erat dui luctus libero, et lobortis ipsum eros sit amet ex. Nam bibendum tincidunt magna nec egestas. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Quisque pharetra leo enim, at lacinia erat tristique eget. Cras sit amet nunc leo. Nunc ut elit non urna vestibulum efficitur et sit amet felis.
  
  Curabitur accumsan, sapien sed gravida tempus, nulla elit iaculis turpis, nec ultricies massa justo id erat. Sed posuere ipsum vitae urna posuere lacinia. Cras eu malesuada est. Ut egestas pretium eros et rhoncus. Pellentesque quis arcu scelerisque, tempor turpis in, sagittis nisi. Proin eget rutrum turpis, vitae aliquam mauris. Duis sodales nunc elit, eu ultricies nisi interdum ut. Nunc eleifend fringilla quam, ut mollis mauris ultricies in. Fusce molestie, dolor convallis eleifend bibendum, lorem felis euismod nisi, id ullamcorper mi enim sed metus. Sed quis neque accumsan, scelerisque est quis, blandit magna. Maecenas ac ante eget libero interdum tristique. Nam quam sapien, tincidunt hendrerit nibh ut, faucibus porttitor magna. Morbi tempor enim nulla, fringilla porttitor augue euismod vel.
  
  Nam tempus, turpis nec semper condimentum, dui magna condimentum odio, sed efficitur orci orci vitae mi. Praesent sed massa quis est pellentesque finibus. Nam vehicula in urna vel cursus. Integer id vestibulum quam. Duis mollis mi dolor, eget faucibus elit iaculis sed. Interdum et malesuada fames ac ante ipsum primis in faucibus. In quis fringilla purus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Morbi pellentesque, leo id blandit hendrerit, felis nisl venenatis tortor, id volutpat lorem erat pellentesque mi. Donec sollicitudin, lectus et malesuada molestie, eros sapien luctus magna, quis suscipit sem erat nec ligula. Maecenas nisl erat, mollis sed ex ac, elementum aliquet ex. Cras blandit varius consequat. Morbi sed efficitur felis.
  
  Cras eu porta dui, quis mollis dolor. Morbi eu placerat elit, pharetra porta libero. Fusce volutpat vel enim a viverra. Nam lectus ligula, interdum a arcu non, viverra viverra orci. Ut mi diam, ultrices eget lorem eu, fermentum tempor turpis. Sed sapien lacus, rhoncus vel egestas sit amet, fermentum et felis. Integer turpis diam, luctus finibus sapien sed, ultrices lobortis nisl. Praesent scelerisque lacinia tempor. Integer porta erat erat, sit amet efficitur ligula congue a. Morbi et lacus imperdiet, volutpat urna in, scelerisque lectus. Aliquam tempus sit amet ligula sit amet facilisis. Mauris lacinia euismod ipsum at imperdiet. Phasellus quis quam posuere, laoreet elit quis, mollis nibh. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Maecenas a turpis tempor, porta ante sit amet, accumsan ipsum. Nam sed velit vehicula, luctus nibh non, dapibus ante.
  
  Donec sit amet eleifend leo. Proin ac nibh tortor. Pellentesque feugiat aliquet euismod. Sed lorem augue, lacinia at dolor eu, porttitor posuere lorem. Suspendisse tempus finibus commodo. Morbi mi ex, mattis sed efficitur ultricies, faucibus id nulla. Ut in leo hendrerit, malesuada metus at, scelerisque augue. Nam nec diam nunc. Etiam molestie ipsum eu augue finibus tincidunt. Aliquam lobortis luctus mi, eu molestie magna euismod varius. Quisque molestie mi ac enim vulputate placerat. Nulla auctor massa ex, sit amet ultricies quam volutpat quis.
  
  Suspendisse aliquet varius mi eu sodales. Morbi a nisl sed felis varius elementum ac non libero. Nam tristique vehicula ex sed rhoncus. In lobortis venenatis lectus, id varius enim vestibulum eu. Vivamus aliquet consectetur neque, pharetra hendrerit nisi. Mauris sed laoreet nunc. Etiam facilisis ullamcorper risus, nec dapibus elit. Quisque faucibus sit amet velit non porta. Aliquam quis mi sodales, accumsan elit eu, ornare lacus.
  
  Phasellus tempus purus magna, egestas porttitor leo tristique a. Nulla maximus diam eu venenatis vestibulum. Fusce ac faucibus sem, sit amet auctor est. Nullam eleifend non turpis at faucibus. Pellentesque sollicitudin placerat erat eu fermentum. Praesent elementum rutrum efficitur. Nunc eget tempus nisl. Vivamus accumsan lobortis lorem vel consectetur. Proin ac ornare enim, vehicula aliquet felis. Morbi sagittis risus et nisi sollicitudin tincidunt. Fusce a viverra mauris. Etiam rutrum nec urna efficitur eleifend. Pellentesque tempor sem metus, et faucibus lorem malesuada euismod. Fusce id laoreet nisl, at posuere lectus.
  
  Phasellus iaculis, massa id gravida elementum, ligula nisl tempus eros, id sodales elit tellus eu lorem. Sed vel sagittis lorem. Sed non molestie risus, facilisis ornare turpis. Donec interdum ligula ac posuere hendrerit. Duis sit amet ante tellus. Pellentesque quis leo vitae risus malesuada imperdiet. Mauris efficitur dolor risus, quis molestie purus accumsan ut. Sed faucibus hendrerit porta. Sed sit amet est ipsum. Praesent venenatis maximus ex eu pulvinar. Nunc non sapien ac est vestibulum blandit quis et erat. Nunc vel lacus ullamcorper, rhoncus lacus sed, pharetra leo. Vivamus ut scelerisque elit. Morbi quam lacus, interdum ac ultricies sit amet, faucibus sit amet ante.
  
  Etiam convallis erat ac tellus luctus feugiat. Suspendisse mattis purus at quam rhoncus consectetur. Sed eleifend risus vitae tortor vulputate facilisis. Mauris eu dapibus elit, eget pharetra nunc. Phasellus at lectus et tellus posuere condimentum sit amet in nibh. Etiam quis semper urna. Vivamus tellus risus, faucibus nec pharetra vel, sodales et nibh. Maecenas sed quam orci.</p></div>`);

  
  $(".about").append(h1);
  $(".about").append(img);
  $(".about").append(p);
}
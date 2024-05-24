// DDX Bricks Wiki - See https://developer.domo.com/docs/ddx-bricks/getting-started-using-ddx-bricks
// for tips on getting started, linking to Domo data and debugging your app
 
//Available globals
var domo = window.domo; // For more on domo.js: https://developer.domo.com/docs/dev-studio-guides/domo-js#domo.get
var datasets = window.datasets;

//Step 1. Select your dataset(s) from the button in the bottom left corner



//Step 2. Query your dataset(s): https://developer.domo.com/docs/dev-studio-references/data-api
var query = `/data/v1/${datasets[0]}`;
domo.get(query).then(handleResult);



//Step 3. Do something with the data from the query result
function handleResult(data){
  console && console.log(data);

  var table = new Tabulator("#tabulator-table", {
      data:data,
      columns:[
          {title:"Ranking", field:"Board Game Rank"},
          {title:"Image", field:"thumbnail", formatter: "image"},
          {title:"Name", field:"primary", headerFilter:"input"},
          {title:"Description", field:"description", headerFilter:"input"},
          {title:"Stars", field:"average", formatter: "star"},
          {title:"Own", field:"own", hozAlign:"center", editor:true, formatter:"tickCross"},

      ],
      layout:"fitColumns",
      pagination:"local",
      paginationSize:10,
      paginationSizeSelector:[10, 25, 50, 100],
  });
}
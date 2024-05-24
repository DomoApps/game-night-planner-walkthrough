var datasets = ['boardgames'];
const collectionAlias = 'ownership';
const userId = domo.env.userId;

async function fetchData() {
    console.log("fetching data");
    // Query your dataset(s): https://developer.domo.com/docs/dev-studio-references/data-api
    const boardGameDataQuery = `/data/v1/${datasets[0]}`;
    const boardGameOwnershipDataQuery = {
        "owner": {
            "$eq": userId
        }
    }

    const boardGameData = await domo.get(boardGameDataQuery);
    const boardGameOwnershipData = await domo.post(`/domo/datastores/v1/collections/${collectionAlias}/documents/query`, boardGameOwnershipDataQuery)

    const data = mergeGameData(boardGameData, boardGameOwnershipData);

    handleResult(data);

}

function mergeGameData(inputData, mergeList) {
    // Step 1: Add an 'owner' field to every item in inputData, defaulting to false
    inputData.forEach(item => {
        item.owned = false;
    });

    // Step 2: Create a mapping from boardGameId to 'owned' status from the mergeList
    const ownershipMap = mergeList.reduce((acc, cur) => {
        const boardGameId = cur.content.boardGameId;
        const ownedStatus = cur.content.owned;
        acc[boardGameId] = ownedStatus;
        return acc;
    }, {});

    // Step 3: Update the 'owner' field in inputData based on the mergeList 'owned' status
    inputData.forEach(item => {
        if (ownershipMap.hasOwnProperty(item.id)) {
            item.owned = ownershipMap[item.id];
        }
    });

    return inputData;
}


const handleCellEdited = async (cell) => {
    const rowData = cell._cell.row.data;
    const boardGameId = rowData.id;
    const ownedValue = rowData.owned;

    // check if a document already exists in AppDB for the current user and board game.
    const appDBQuery = `{
        "owner": {
            "$eq": ${userId}
        },
        "content.boardGameId": {
            "$eq": ${boardGameId}
        }
    }`


    const existingAppDBDocument = await domo.post(`/domo/datastores/v1/collections/${collectionAlias}/documents/query`, appDBQuery)

    const document = {
        "content": {
            "boardGameId": boardGameId,
            "owned": ownedValue
        }
    }
    
    if (existingAppDBDocument.length > 0) {
        // update existing document
        const existingDocumentId = existingAppDBDocument[0].id;
        const updatedDocument = await domo.put(`/domo/datastores/v1/collections/${collectionAlias}/documents/${existingDocumentId}`, document)
        console.log("updatedDocument", updatedDocument);
        

    } else {
        // create new document
        const newDocument = await domo.post(`/domo/datastores/v1/collections/${collectionAlias}/documents/`, document);
        console.log("newDocument", newDocument);
    }
}



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
          {title:"Own", field:"owned", hozAlign:"center", editor: true, cellEdited: handleCellEdited, formatter:"tickCross", headerFilter:"tickCross"},

      ],
      layout:"fitColumns",
      pagination:"local",
      paginationSize:10,
      paginationSizeSelector:[10, 25, 50, 100],
  });
}
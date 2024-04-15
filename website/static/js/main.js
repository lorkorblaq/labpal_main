$(function () {
    console.log("MAIN ready");
    BaseUrl = "http://13.53.70.208:3000/api/"

    $('#InputItemMain').typeahead({
        source: function (request, response) {
            $.ajax({
                url: `${BaseUrl}/items/get/`, // Replace with your API endpoint for item search
                method: "GET",
                data: { term: request.term },
                dataType: "json",
                success: function (data) {
                    console.log("Retrieved data:", data);
                    const itemNames = data.items.map(item => item.item);
                        response(itemNames);
                    },
                error: function (error) {
                    console.error("Error fetching item data:", error);
                    }
                });
            },
        });
    $('#autoInputItem').typeahead({
        source: function (request, response) {
            $.ajax({
                url: `${BaseUrl}/items/get/`, // Replace with your API endpoint for item search
                method: "GET",
                data: { term: request.term },
                dataType: "json",
                success: function (data) {
                    console.log("Retrieved data:", data);
                    const itemNames = data.items.map(item => item.item);
                    response(itemNames);
                    },
                error: function (error) {
                    console.error("Error fetching item data:", error);
                    }
                });
            },
        });
    $('#autoInputLot').typeahead({
        source: function (request, response) {
            $.ajax({
                url: `${BaseUrl}/lotexp/get/`, // Replace with your API endpoint for item search
                method: "GET",
                data: { term: request.term },
                dataType: "json",
                success: function (data) {
                    // console.log("Retrieved data:", data);
                    const lotNumb = data.lotexp.map(lot => lot.lot_numb);
                    console.log(lotNumb);
                    response(lotNumb);
                    },
                error: function (error) {
                    console.error("Error fetching lot data:", error);
                    }
                });
            },
        });
    function refreshTable() {
        fetchData(`${BaseUrl}/channels/get/`).then(data => {
            dataTableInstance.clear();
            dataTableInstance.rows.add(data.channels);
            dataTableInstance.draw();
        }).catch(error => {
            console.error("Error fetching data:", error);
        });
    }
});
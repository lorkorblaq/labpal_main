$(function () {
    console.log("inventory.js loaded");
    const headersItem = ['Item','In Stock(vials)', 'Tests/Vial',  'Category', 'Bench'];
    const ColumnsItem = ['item',  'in stock', 'tests/vial', 'category', 'bench', ];
    const columnsLot = ['item', 'lot_numb', 'expiration', 'quantity', 'created at'];
    const headersLot = ['Item', 'Lot','Expiration', 'Quantity', 'Created At'];
    BaseUrl = "http://13.53.70.208:3000/api"
    // BaseUrl = "http://0.0.0.0:3000/api";

    function fetchData(url) {
        // Fetch data from the provided URL
        return $.get(url);
    }

    function renderInventoryTable(data, columns) {
        if ($.fn.DataTable.isDataTable('#inventory_table')) {
            $('#inventory_table').DataTable().clear().destroy();
        }
        // const items = data.items;
        $('#inventory_table').DataTable({
            data: data,
            columns: columns.map(col => ({ data: col })),
            // responsive: true
        });
        } 
    function renderExpireTable(data, columns) {
        // if (dataTableInstance) {
        //     dataTableInstance.destroy();
        //     }
        // Destroy the existing DataTable instance (if it exists)
        if ($.fn.DataTable.isDataTable('#expire_table')) {
            $('#expire_table').DataTable().clear().destroy();
        }
    
        // Initialize a new DataTable instance
        $('#expire_table').DataTable({
            data: data,
            columns: columns.map(col => ({ data: col }))
        });
        }
    async function loadInventoryData() {
        headersItem.forEach(function (header_inventory) {
            $('#inventory_head').append(`<th>${header_inventory}</th>`);
        });
        try {
            const data = await fetchData(`${BaseUrl}/items/get/`);
            // console.log(data);
            renderInventoryTable(data.items, ColumnsItem);
            } 
        catch (error) {
            console.error("Error fetching data:", error);
            }
        };
    loadInventoryData();   
    async function loadexpireData(){
        headersLot.forEach(function (header_expire) {
            $('#expire_head').append(`<th>${header_expire}</th>`);
        });
        try {
            const data = await fetchData(`${BaseUrl}/lotexp/get/`);
            console.log(data.lotexp);
            renderExpireTable(data.lotexp, columnsLot);
            } 
        catch (error) {
            console.error("Error fetching data:", error);
            }
        };
    loadexpireData();
    
        // Replace the existing click event with change event for the dropdown
    $('#inventory_filter').change(async function () {
        const filter = $(this).val();
        try {
            const data = await fetchData(`${BaseUrl}/items/get/`);
            let filteredData;
            switch (filter) {
                case 'stock':
                    // Display all items
                    renderInventoryTable(data.items, ColumnsItem);
                    break;
                case 'alert':
                    // Filter items with "in stock" less than or equal to 5
                    filteredData = data.items.filter(item => item['in stock'] <= 5);
                    renderInventoryTable(filteredData, ColumnsItem);
                    break;
                case 'safe':
                    // Filter items with "in stock" between 5 and 10 (inclusive)
                    filteredData = data.items.filter(item => item['in stock'] <= 10);
                    renderInventoryTable(filteredData, ColumnsItem);
                    break;
                case 'reorderLevel':
                    // Filter items with "in stock" between 5 and 10 (inclusive)
                    filteredData = data.items.filter(item => item['in stock'] <= item['reOrderLevel']);
                    renderInventoryTable(filteredData, ColumnsItem);
                    break;
                default:
                    console.error("Invalid filter option");
                }
            } 
        catch (error) {
            console.error("Error fetching data:", error);
            }
        });

    $('#expiry_filter').change(async function () {
        const filter = $(this).val();
        if (filter === "") {
            // Clear the table and return
            $('#expire_table').DataTable().clear().draw();
            return;
        }
        try {
            const data = await fetchData(`${BaseUrl}/lotexp/get/`);
            const currentDate = new Date();
            let filteredData;
            switch (filter) {
                case 'present':
                    filteredData = data.lotexp.filter(item => new Date(item['expiration']) <= currentDate);
                    break;
                case '30':
                    const dateIn30Days = new Date();
                    dateIn30Days.setDate(currentDate.getDate() + 30);
                    filteredData = data.lotexp.filter(item => new Date(item['expiration']) > currentDate && new Date(item['expiration']) <= dateIn30Days);
                    break;
                case '60':
                    const dateIn60Days = new Date();
                    dateIn60Days.setDate(currentDate.getDate() + 60);
                    filteredData = data.lotexp.filter(item => new Date(item['expiration']) > currentDate && new Date(item['expiration']) <= dateIn60Days);
                    break;
                case '90':
                    const dateIn90Days = new Date();
                    dateIn90Days.setDate(currentDate.getDate() + 90);
                    filteredData = data.lotexp.filter(item => new Date(item['']) > currentDate && new Date(item['expiration']) <= dateIn90Days);
                    break;
                }
            renderExpireTable(filteredData, columnsLot);
            } 
        catch (error) {
            console.error("Error fetching data:", error);
            }    
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
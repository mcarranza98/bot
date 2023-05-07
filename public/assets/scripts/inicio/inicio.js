const action_iconsNP = `<div class="d-flex order-actions" bis_skin_checked="1">	
                    <a href="javascript:;"  data-bs-toggle="modal" data-bs-target="#nuevo_producto"><i class="bx bx-edit"></i></a>
                    <a href="javascript:;"  data-bs-toggle="modal" data-bs-target="#eliminar_producto" class="ms-4"><i class="bx bx-trash"></i></a>
                    </div>`;

const settings_iconNP = `<div class="d-flex order-actions" bis_skin_checked="1">	
                        <a href="javascript:;" id="btnModalVariaciones" data-bs-toggle="modal" data-bs-target="#modal_variaciones" class=""><i class="bx bx-cog"></i></a>
                        </div>`;

const action_iconsNV = `<div class="d-flex order-actions" bis_skin_checked="1">	
                    <a href="javascript:;"  data-bs-toggle="modal" data-bs-target="#nueva_variacion"><i class="bx bx-edit"></i></a>
                    <a href="javascript:;"  data-bs-toggle="modal" data-bs-target="#eliminar_variacion"class="ms-4"><i class="bx bx-trash"></i></a>
                    </div>`;


$('#productos-table').DataTable({
    "initComplete": function(settings, json) {

        load_producto_table();

        $("#productos-table").on('change',"input[type='checkbox']",function(e){

            const state = $(this).is(":checked");
            let state_text = "";

            if(state){
                state_text = "true";
            }else{
                state_text = "false";
            }

            const tr = $(this).closest("tr");
            const data = $("#productos-table").DataTable().row(tr).data();
            updateState("productos", data.id, state_text);

        });

    },
    "oLanguage": {
            "sUrl": "../../../public/assets/datatable/spanish-datatable.json"
        },
    dom: 'lrt',
    columns: [

        { data: 'descripcion', title: 'Descripción'},
        { data: 'code', title: 'Referencia'},
        { data: 'precio', title: 'Precio', orderable: false, width: '80px' },
        { data: 'estado_checkbox', title: 'Disponibilidad', orderable: false, width: '110px'},
        { title: 'Variaciones', class: 'details-control', orderable: false, data: null, defaultContent: settings_iconNP, width: '50px' },
        { title: 'Opciones', class: 'details-control', orderable: false, data: null, defaultContent: action_iconsNP, width: '50px' },
    

    ],
    autoWidth: false,
    info: false,
    paging: false,
    targets: 'no-sort',
    bSort: true,
    order: [[ 0, 'asc' ]],

});

$('#variacion-table').DataTable({
    "initComplete": function(settings, json) {
        load_variaciones_table();

        $("#variacion-table").on('change',"input[type='checkbox']",function(e){

            const state = $(this).is(":checked");
            let state_text = "";

            if(state){
                state_text = "true";
            }else{
                state_text = "false";
            }

            const tr = $(this).closest("tr");
            const data = $("#variacion-table").DataTable().row(tr).data();
            updateState("variaciones", data.id, state_text);

        });
    },
    "oLanguage": {
            "sUrl": "../../../public/assets/datatable/spanish-datatable.json"
        },
    dom: 'lrt',
    columns: [

        { data: 'descripcion', title: 'Descripción'},
        { data: 'code', title: 'Referecia'},
        { data: 'precio_extra', title: 'Precio extra', orderable: false, width: '80px'  },
        { data: 'estado_checkbox', title: 'Disponibilidad', orderable: false, width: '110px'},
        { title: 'Opciones', class: 'details-control', orderable: false, data: null, defaultContent: action_iconsNV, width: '50px' }

    ],
    autoWidth: false,
    info: false,
    paging: false,
    targets: 'no-sort',
    bSort: true,
    order: [[ 0, 'asc' ]],

});




$('#settings').on('shown.bs.modal', async function (e) {

    $.ajax({
        url: "/load_settings",
        type: "GET",
        success: function(data){
            
            if(data.res.length){

                $('#localName').val(data.res[0].nombre);
                $('#initialCost').val(data.res[0].cobro_inicial);
                $('#kilometerCost').val(data.res[0].cobro_kilometro);
                $('#localMenuURL').val(data.res[0].menu);
                $('#areaEnvio').val(data.res[0].cobertura);
                $('#numeroTelefono').val(data.res[0].telefono);
                $('#selectPrinter').val(data.res[0].impresora).trigger('change');
                $('#selectPaper').val(data.res[0].papel).trigger('change');
                var coord = data.res[0].coordenadas.split(',');
                locPicker.setLocation( {lat: parseFloat(coord[0]), lng: parseFloat(coord[1])} )
                $('#selectPaper').val(data.res[0].papel).trigger('change');
                const shippingType = data.res[0].shippingType;
                if(shippingType == "area"){
                    $("#shippingArea").prop('checked',true);
                    $("#areaMode").fadeIn(300);
                    $("#zonesMode").hide();
                }else{
                    $("#shippingZone").prop('checked',true);
                    $("#zonesMode").fadeIn(300);
                    $("#areaMode").hide();
                }
                $("#asistantName").val(data.res[0].asistant)

                
                const isAutocompleteOrders = data.res[0].autocompleteorders == "true" ? true : false;

                $("#isAutocompleteOrders").prop('checked',isAutocompleteOrders)
                
            }
            if(data.image != "Sin imagen"){
                const imageData = data.image.data;
                const imageDom = `<img style="max-width:300px" src="${imageData}">`;
                $("#logoSettings").html(imageDom);
            }else{
                $("#logoSettings").html(data.image);

            }
            
        }
    });

    const messages = await asyncPostAjax('/messages/get',{});
    if (Object.keys(messages).length === 0){
        
        $("#defaults-CustomMsg-1").click();
        $("#defaults-CustomMsg-2").click();
        $("#defaults-CustomMsg-3").click();
        $("#defaults-CustomMsg-4").click();
        $("#defaults-CustomMsg-5").click();
        $("#defaults-CustomMsg-6").click();
        $("#defaults-CustomMsg-7").click();
        $("#defaults-CustomMsg-8").click();

    }else{
        $("#cm1_maxorders").val(messages.maxorders)
        $("#cm1-textarea").val(messages.wellcome)
        $("#cm2-textarea").val(messages.instructions)
        $("#cm3-textarea").val(messages.orderloop)
        $("#cm4-textarea").val(messages.orderName)
        $("#cm5-textarea").val(messages.shipmethods)
        //Mensajes de error
        $("#cm1-textarea-error-limit").val(messages.maxordersError)
        $("#cm1-textarea-error-num").val(messages.wellcomeError)
        $("#cm2-textarea-error-noorder").val(messages.instructionsError)
        $("#cm5-textarea-error-num").val(messages.shipmethodsError)

        $("#cm6-textarea").val(messages.peConformation2)
        $("#cm6-textarea-2").val(messages.peConformation1)

        $("#cm7-textarea").val(messages.completeConfirmation1)
        $("#cm7-textarea-2").val(messages.completeConfirmation2)

        $("#cm8-textarea").val(messages.autoCompleteConfirmation);
        $("#minutesAutoComplete").val(messages.autoCompleteTime);
     
        
    }

    const shippingzones = await asyncPostAjax('/mapzones/get',{})
    if(shippingzones){
        
        addMapPolygons(shippingzones);
    }

});

$('input[type=radio][name=typeOfMenu]').on('change', function() {

    switch ($(this).val()) {

      case 'menuURL':
        $('#localMenuFile').hide();
        $('#localMenuURL').show();
        break;

      case 'menuFile':
        $('#localMenuURL').hide();
        $('#localMenuFile').show();
        break;

    }
});

$("#run_query_form").submit(async function(e) {
    
    e.preventDefault();

    const $form = $("#run_query_form");
    const data = getFormData($form);

    $.ajax({
        url: "/run_query",
        type: "POST",
        data: data,
        success: function(data){
            
            if(data.state == "success"){
                
                showNotification("success", data.message);
                $("#run_query").modal("hide");
                
            }
            
        }
    });
    
});

function limpiarCheck(idModal){

    $(`#${idModal}`).find('input[type=checkbox]').each(function(){

        $(this).prop("checked", false);

    })
}

function limpiarInput(idModal){

    $(`#${idModal}`).find('input[type=text]').each(function(){

        $(this).val('');

    })
}

/*  EDITAR PRODUCTOS  */

$('#btnNuevoProd').on('click', function (e) {

    limpiarCheck('nuevo_producto');
    limpiarInput('nuevo_producto');

    $('#txtNuevoProd').text('Nuevo producto');

    $("#nuevo_producto").removeData();

});

const tablaProd = $('#productos-table').DataTable();

/*CLICK EN TABLA*/

$('#productos-table tbody').on('click', 'tr', function () {

    $('#txtNuevoProd').text('Editar producto');

    limpiarCheck('nuevo_producto');

    const row = tablaProd.row(this).data();
    const {id, descripcion, precio, variaciones, code} = row;

    $("#productName").val(descripcion);
    $('#productPrice').val(precio);
    $('#prod_code').val(code || "");

    var varArray = variaciones != null ? variaciones.split(',').filter(n => n) : 0 ;

    for( var i = 0 ; i < varArray.length ; i++ ){

        $(`#${varArray[i]}`).prop("checked", true);

    }

    $("#nuevo_producto").modal().data({id});
    $("#modal_variaciones").modal().data({id, descripcion});

});

/*  EDITAR VARIACIONES  */

$('#btnNuevaVariacion').on('click', function (e) {

    limpiarInput('nueva_variacion')

    $('#txtNuevaVariacion').text('Nuevo producto');

    $("#nueva_variacion").removeData();

});

const tablaVar = $('#variacion-table').DataTable();

/*CLICK EN TABLA*/

$('#variacion-table tbody').on('click', 'tr', function () {

    $('#txtNuevaVariacion').text('Editar producto');


    const row = tablaVar.row(this).data();
    const {id, descripcion, precio_extra} = row;


    $('#variacionPrice').val(precio_extra);
    $('#variacionName').val(descripcion);

    $("#nueva_variacion").modal().data({id});

});

/* FINAL EDITAR VARIACION */


$("#settings_form").submit(async function(e) {

    e.preventDefault();

    const $form = $("#settings_form");
    const data = getFormData( $form );

    var location = locPicker.getMarkerPosition();

    data.initialCost = $("#initialCost").val();
    data.kilometerCost = $("#kilometerCost").val();
    data.areaEnvio = $("#areaEnvio").val();
    data.localLocation = location.lat + ',' + location.lng;
    data.autocomplete = $("#autocomplete").val();

    if($("#shippingArea").prop('checked')){
        data.shippingType = "area";
      


    }
    if($("#shippingZone").prop('checked')){
        data.shippingType = "zone";
      
    }

    

   const file = $("#localLogo")[0].files[0];
   if (file){
    const filebase64 = await getBase64(file);

    data.logo = filebase64;
   }

   data.autocompleteorders= $("#isAutocompleteOrders").prop('checked').toString(),

   console.log({data})
   const result = await asyncPostAjax('/upload_settings',data);
   console.log(result)
   if(result.state == "success"){
                
        showNotification("success", result.message);
        $("#settings").modal("hide");
    
    }

    //
    saveMessages();

    
});


async function saveMessages(){

    const tableData = {
        maxorders: $("#cm1_maxorders").val(),
        wellcome: $("#cm1-textarea").val(),
        instructions: $("#cm2-textarea").val(),
        orderloop: $("#cm3-textarea").val(),
        orderName: $("#cm4-textarea").val(),
        shipmethods: $("#cm5-textarea").val(),

        maxordersError: $("#cm1-textarea-error-limit").val(),
        wellcomeError: $("#cm1-textarea-error-num").val(),
        instructionsError: $("#cm2-textarea-error-noorder").val(),
        shipmethodsError: $("#cm5-textarea-error-num").val(),

        peConformation1: $("#cm6-textarea").val(), //por entregar confirmacion domicilio
        peConformation2: $("#cm6-textarea-2").val(), // por entregar confirmacion sucursal

        completeConfirmation1: $("#cm7-textarea").val(), //completado confirmacion domicilio
        completeConfirmation2: $("#cm7-textarea-2").val(), // completado confirmacion sucursal
        autoCompleteTime: $("#minutesAutoComplete").val() != "" ? $("#minutesAutoComplete").val() : "20", 
        autoCompleteConfirmation: $("#cm8-textarea").val()
        
        //maxorders_error: "X [my-restaurant-name] X"

    }
    console.log(tableData)
    await asyncPostAjax('/messages/save',tableData);
}

/*  MODAL VARIACIONES  */

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

$('#modal_variaciones').on('shown.bs.modal', function (e) {
    
    $('#divNoVariable').remove();

    const dataModal = $("#modal_variaciones").modal().data();

    $( '#txtVariacion' ).text( dataModal.descripcion );

    $.ajax({
        url: "/load_estado_variacion",
        type: "POST",
        data: dataModal,
        success: function(data){

            const variaciones = data.variaciones;

            $('#left_variaciones_column_switch').empty();
            $('#right_variaciones_column_switch').empty();

            if( variaciones.length > 0 ){

                const element = `<label id="txtVariacionesActivas" class="form-check-label">Variaciones activas para este producto.<br></label>`;
                $(element).insertBefore( $('#left_variaciones_column_switch') );

                variaciones.forEach((variacion,index) => {

                    const switchCheck = `<div class="form-check form-switch " id="div${variacion.id}" bis_skin_checked="1">
                                            <label class="form-check-label" for="${variacion.id}">${variacion.descripcion}</label>
                                            <input name="${variacion.id}" class="form-check-input" type="checkbox" id="${variacion.id}" ${variacion.estado}>
                                        </div>`

                    if(index % 2 == 0){

                        $('#left_variaciones_column_switch').append(switchCheck);

                    }else{

                        $('#right_variaciones_column_switch').append(switchCheck);

                    }

                });

            }else{

                const noVariable = `<div id="divNoVariable" bis_skin_checked="1">
                                        <label class="form-check-label">Este producto no cuenta con variaciones.</label>
                                    </div>`;

                $(noVariable).insertAfter($('#modal_variaciones_form'));

            }
            
        }
    });

});

$('#modal_variaciones').on('hidden.bs.modal', function (e) {

    $( '#txtVariacion' ).text( '' );

    $(this).find('input[type=checkbox]').each(function(){

        $(this).remove();

    })

    $('#txtVariacionesActivas').remove()

});

$("#modal_variaciones_form").submit(async function(e) {
    
    e.preventDefault();

    const $form = $(this);
    const data = getFormData($form);

    const {id} = $("#nuevo_producto").modal().data();
    data.id = id;

    $.ajax({
        url: "/update_estado_variacion",
        type: "POST",
        data: data,
        success: function(data){

            if(data.state == "success"){

                $('#productos-table').DataTable().clear().draw();
                showNotification("success", data.message);
                $("#modal_variaciones").modal("hide");
                load_producto_table();
                
            }

        }
    });

});

$("#eliminar_producto_form").submit(async function(e) {
    e.preventDefault();

    const data = $("#nuevo_producto").modal().data();

    $.ajax({
        url: "/eliminar_producto",
        type: "POST",
        data: data,
        success: function(data){

            if(data.state == "success"){

                $('#productos-table').DataTable().clear().draw();
                showNotification("success", data.message);
                $("#eliminar_producto").modal("hide");
                load_producto_table();
                
            }

        }
    });

});

$("#eliminar_variacion_form").submit(async function(e) {
    e.preventDefault();

    const data = $("#nueva_variacion").modal().data();

    $.ajax({
        url: "/eliminar_variacion",
        type: "POST",
        data: data,
        success: function(data){

            if(data.state == "success"){

                $('#variacion-table').DataTable().clear().draw();
                showNotification("success", data.message);
                $("#eliminar_variacion").modal("hide");
                load_variaciones_table();
                
            }

        }
    });

});

$("#nueva_variacion_form").submit(async function(e) {

    e.preventDefault();

    const $form = $(this);
    const data = getFormData($form);

    data.variacionPrice = data.variacionPrice != "" ? data.variacionPrice : "0";

    const {id} = $("#nueva_variacion").modal().data();

    if( id == undefined ){

        const result = await asyncPostAjax('/upload_variacion',data)
        
        if(result.state == "success"){

            $('#variacion-table').DataTable().clear().draw();
            showNotification("success", result.message);
            $("#nueva_variacion").modal("hide");
            load_variaciones_table();

        }else if(result.state == "error"){

            showNotification("Error", result.message);

            const camposRed = result.campos;
            camposRed.forEach( campo => {
                $(`#${campo}`).addClass('redBorder');
            })

        }
        
    }else{

        data.id = id;

        const result = await asyncPostAjax("/update_variacion", data)
        if(result.state == "success"){
            $('#variacion-table').DataTable().clear().draw();
            showNotification("success", result.message);
            $("#nueva_variacion").modal("hide");
            load_variaciones_table();

        }else if(result.state == "error"){

            showNotification("Error", result.message);

            const camposRed = result.campos;
            camposRed.forEach( campo => {
                $(`#${campo}`).addClass('redBorder');
            })

        }

    }

});



function updateState(table, id, state){

    const object = {
        table : table,
        id: id,
        state : state
    };
    
    $.ajax({
        url: "/update_state",
        type: "POST",
        data: object,
        success: function(data){
            
            showNotification("success", data.message);

        }

    });

}

$(document).ready(async function() {
    

    const orders = await asyncPostAjax('/getAllOrders',{})
    console.log(orders)
    $('#OrdersTable').DataTable().rows.add( orders ).draw();
  
});


window.api.receive("SETTINGS", async (data) => { // exception on trying to access window.api.receive
    
    showNotification("warning","Configuración incompleta");

});


async function asyncPostAjax( path, data, ){

    return await $.ajax({

        type: 'POST',
        url: path,
        data: JSON.stringify( data ),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        success: function(result){
        
            return result;
            
        },

    });

}

window.addEventListener("load", (event) => {
	


});
const action_iconsNP = `<div class="d-flex order-actions" bis_skin_checked="1">	
                    <a href="javascript:;"  data-bs-toggle="modal" data-bs-target="#nuevo_producto"><i class="bx bx-edit"></i></a>
                    <a href="javascript:;"  data-bs-toggle="modal" data-bs-target="#eliminar_producto" class="ms-4"><i class="bx bx-trash"></i></a>
                    </div>`;

const settings_iconNP = `<div class="d-flex order-actions" bis_skin_checked="1">	
                        <a href="javascript:;" id="btnModalVariaciones" data-bs-toggle="modal" data-bs-target="#modal_variaciones" class=""><i class="bx bx-cog"></i></a>
                        </div>`;

const action_iconsNV = `<div class="d-flex order-actions" bis_skin_checked="1">	
                    <a href="javascript:;"  data-bs-toggle="modal" data-bs-target="#mod_question"><i class="bx bx-edit"></i></a>
                    <a href="javascript:;"  data-bs-toggle="modal" data-bs-target="#delete_question"class="ms-4"><i class="bx bx-trash"></i></a>
                    </div>`;


$('#productos-table').DataTable({
    "initComplete": function(settings, json) {

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

var tablaPreguntas = $('#tablaPreguntas').DataTable({
    "initComplete": function(settings, json) {

    },
    "oLanguage": {
            "sUrl": "../../../public/assets/datatable/spanish-datatable.json"
        },
    dom: 'lrt',
    columns: [

        { data: 'id', title: 'Orden', width: '10%', orderable: false},
        { data: 'pregunta', title: 'Pregunta', orderable: false, width: '50%'  },
        { data: 'cant_resp', title: 'Respuestas', orderable: false, width: '20%'},
        { data: 'opciones', title: 'Opciones', class: 'details-control', orderable: false, defaultContent: action_iconsNV, width: '20%' }

    ],
    autoWidth: false,
    info: false,
    paging: false,
    /*rowReorder: {
        selector: 'tr'
      },*/
    targets: 'no-sort',
    bSort: true,
    order: [[ 0, 'asc' ]],

});


	
$('#settings').on('shown.bs.modal', async function () {

        const getSettings = await asyncGetAjax('/load_settings');

        const {botNumber, email, id, name, secondaryNumber} = getSettings.res;

        $('#name').val(name);
        $('#botNumber').val(botNumber);
        $('#secondaryNumber').val(secondaryNumber);
        $('#email').val(email);

});


$('#settings_form').submit( async function(event) {
    event.preventDefault();

    const $form = $("#settings_form");
    const data = getFormData($form);

    const postSettings = await asyncPostAjax('/upload_settings', data );

    if( postSettings.state = 'success' ){

        $('#settings').modal('toggle');

    }


    showNotification(postSettings.state,  postSettings.message);
});



  $('#basic_messages').on('shown.bs.modal', async function () {

    const getBasics = await asyncGetAjax('/load_basics');

    const {firstMessage, lastMessage, wrongAnswer} = getBasics.res;

    $('#firstMessage').val(firstMessage);
    $('#lastMessage').val(lastMessage);
    $('#wrongAnswer').val(wrongAnswer);

});


$('#basic_messages_form').submit( async function(event) {
    event.preventDefault();

    const $form = $("#basic_messages_form");
    const data = getFormData($form);

    const postBasics = await asyncPostAjax('/upload_basics', data);

    if( postBasics.state = 'success' ){

        $('#basic_messages').modal('toggle');

    }

    showNotification(postBasics.state,  postBasics.message);
});


$('#add_question_form').submit( async function(event) {
    event.preventDefault();

    const $form = $("#add_question_form");
    const data = getFormData($form);

    const postBasics = await asyncPostAjax('/upload_question', data );

    if( postBasics.state = 'success' ){

        $('#add_question').modal('toggle');
        resetTablaPreguntas();

    }

    showNotification(postBasics.state,  postBasics.message);
});



$('#mod_question_form').submit( async function(event) {
    event.preventDefault();

    const $form = $("#mod_question_form");
    const data = getFormData($form);

    data.id = $('#mod_question').data('id');

    const postBasics = await asyncPostAjax('/update_question', data );

    if( postBasics.state = 'success' ){

        $('#mod_question').modal('toggle');
        resetTablaPreguntas();

    }

    showNotification(postBasics.state,  postBasics.message);
});


$('#divRespuestas').on('click' , ".rspIG.input-group-text" ,  function() {

    var padreDirecto = $(this).parent();

    padreDirecto.remove();

    var divContenedor = $('#divRespuestas');

    // Obtener todos los elementos de entrada (input group) dentro del div
    var inputs = divContenedor.find('.input-group-text');

    // Recorrer cada elemento y asignar el texto con su respectivo número
    inputs.each(function(index) {
        var numero = index + 1;
        $(this).text(numero);
        $( this ).parent().find('input').attr('name', `respuesta-${numero}`);
    });


});

$('#divModRespuestas').on('click' , ".rspIGr.input-group-text" ,  function() {

    var padreDirecto = $(this).parent();

    padreDirecto.remove();

    var divContenedor = $('#divModRespuestas');

    // Obtener todos los elementos de entrada (input group) dentro del div
    var inputs = divContenedor.find('.input-group-text');

    // Recorrer cada elemento y asignar el texto con su respectivo número
    inputs.each(function(index) {
        var numero = index + 1;
        $(this).text(numero);
        $( this ).parent().find('input').attr('name', `respuesta-${numero}`);
    });


});


$( document ).ready(async function() {

    resetTablaPreguntas();

    $('#tablaPreguntas tbody').on('click', 'tr', function() {

        // Obtiene los datos de la fila clickeada
        const {id, cant_resp, respuestas, pregunta} = tablaPreguntas.row(this).data();

        //$('#add_question').modal('toggle');

        let respuestasArray = JSON.parse(respuestas);

        $('#modPregunta').val(pregunta);

        $('#mod_question').data({id: id});

        $('#divModRespuestas').html('');

        let contResp = 0;
        for (var [key, value] of Object.entries(respuestasArray)) {

        contResp++;

        let plantillaRespuesta = `
            <div class="rspIGr input-group mb-3">
                <span class="rspIGr input-group-text" id="respuesta-${contResp}">${contResp}</span>
                <input type="text" class="form-control" id="Inrespuesta-${contResp}" placeholder="Respuesta" name="respuesta-${contResp}">
            </div>`;

            $('#divModRespuestas').append(plantillaRespuesta);
            
            $(`#Inrespuesta-${contResp}`).val(value);

        }


        $('#delete_question').data({id: id});



    });
    
});


$('#delQuest').click(async function() {

    const { id } = $('#delete_question').data();

    const postSettings = await asyncPostAjax('/delete_question', {id} );

    if( postSettings.state = 'success' ){

        $('#delete_question').modal('toggle');
        resetTablaPreguntas()

    }
    showNotification(postSettings.state,  postSettings.message);


});

$('#add_question').on('hidden.bs.modal', function () {
    $('#divRespuestas').html('');
    $('#pregunta').val('');
});

$('#mod_question').on('hidden.bs.modal', function () {
    $('#divModRespuestas').html('');
    $('#modPregunta').val('');
});

function getFormData($form) {

    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function (n, i) {

        indexed_array[n['name']] = n['value'];

    });

    return indexed_array;

}


function addRespuesta(){

    const numResp = $('#divRespuestas').find(".input-group").length + 1;

    if ( numResp <= 9 ) {

        let plantillaRespuesta = `
            <div class="rspIG input-group mb-3">
                <span class="rspIG input-group-text" id="respuesta-${numResp}">${numResp}</span>
                <input type="text" class="form-control" placeholder="Respuesta" name="respuesta-${numResp}">
            </div>`;

        $('#divRespuestas').append(plantillaRespuesta);

    }else{

        alert('El número máximo de respuestas permitidas es de 9');

    }

}


function modRespuesta(){

    const numResp = $('#divModRespuestas').find(".input-group").length + 1;

    if ( numResp <= 9 ) {

        let plantillaRespuesta = `
            <div class="rspIGr input-group mb-3">
                <span class="rspIGr input-group-text" id="respuesta-${numResp}">${numResp}</span>
                <input type="text" class="form-control" placeholder="Respuesta" name="respuesta-${numResp}">
            </div>`;

        $('#divModRespuestas').append(plantillaRespuesta);

    }else{

        alert('El número máximo de respuestas permitidas es de 9');

    }

}


async function resetTablaPreguntas(){

    tablaPreguntas.clear().draw()

    const {res} = await asyncGetAjax('/load_questions');

    const datosTabla = [];

    res.forEach(element => {

        let cant_resp = element.respuestas.split(',').length;

        element.cant_resp = cant_resp;

        datosTabla.push(element);
    });

    tablaPreguntas.rows.add(datosTabla).draw();  
}




async function getOrderData(tel, timestamp){
    const FullOrder = await asyncPostAjax('/fullorder',{tel,timestamp});
    return FullOrder;
}




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


async function asyncGetAjax( path ){

    return await $.ajax({

        type: 'GET',
        url: path,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        success: function(result){
        
            return result;
            
        },

    });

}


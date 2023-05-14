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


	
$('#settings').on('shown.bs.modal', async function () {
		console.log('modal abierto');

        const getSettings = await asyncGetAjax('/load_settings');

        const {botNumber, email, id, name, secondaryNumber} = getSettings.res;

        $('#name').val(name);
        $('#botNumber').val(botNumber);
        $('#secondaryNumber').val(secondaryNumber);
        $('#email').val(email);

        console.log(await asyncGetAjax('/load_settings'));

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
    console.log('modal abierto');

    const getBasics = await asyncGetAjax('/load_basics');

    const {firstMessage, lastMessage, wrongAnswer} = getBasics.res;

    $('#firstMessage').val(firstMessage);
    $('#lastMessage').val(lastMessage);
    $('#wrongAnswer').val(wrongAnswer);

    console.log(await asyncGetAjax('/load_basics'));

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

    console.log({data});

    const postBasics = await asyncPostAjax('/upload_question', data );

    if( postBasics.state = 'success' ){

        $('#add_question').modal('toggle');

    }

    showNotification(postBasics.state,  postBasics.message);
});


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


    console.log($('#divRespuestas').find('.input-group-text'));

    
}


    $('#divRespuestas').on('click' , ".rspIG.input-group-text" ,  function() {
    
        var padreDirecto = $(this).parent();

        padreDirecto.remove();
    
        console.log(padreDirecto);

        var divContenedor = $('#divRespuestas');

        // Obtener todos los elementos de entrada (input group) dentro del div
        var inputs = divContenedor.find('.input-group-text');

        console.log(inputs);

        // Recorrer cada elemento y asignar el texto con su respectivo número
        inputs.each(function(index) {
            var numero = index + 1;
            $(this).text(numero);
            $( this ).parent().find('input').attr('name', `respuesta-${numero}`);
        });
    
    
    });



$(document).ready(async function() {
   
    




});



function getFormData($form) {

    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function (n, i) {

        indexed_array[n['name']] = n['value'];

    });

    return indexed_array;

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


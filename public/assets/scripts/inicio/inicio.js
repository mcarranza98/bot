const action_icons = `<div class="d-flex order-actions" bis_skin_checked="1">	
                    <a href="javascript:;" class=""><i class="bx bx-edit"></i></a>
                    <a href="javascript:;" class="ms-4"><i class="bx bx-trash"></i></a>
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
        { data: 'precio', title: 'Precio', orderable: false, width: '80px'  },
        { data: 'estado_checkbox', title: 'Disponibilidad', orderable: false, width: '110px'},
        { title: 'Opciones', class: 'details-control', orderable: false, data: null, defaultContent: action_icons, width: '50px' }

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
        { data: 'precio_extra', title: 'Precio extra', orderable: false, width: '80px'  },
        { data: 'estado_checkbox', title: 'Disponibilidad', orderable: false, width: '110px'},
        { title: 'Opciones', class: 'details-control', orderable: false, data: null, defaultContent: action_icons, width: '50px' }

    ],
    autoWidth: false,
    info: false,
    paging: false,
    targets: 'no-sort',
    bSort: true,
    order: [[ 0, 'asc' ]],

});


$("#basic_messages_form").submit(function(e) {
    e.preventDefault();
    const $form = $(this);
    const data = getFormData($form);
    console.log( data );
    /*$.ajax({
        url: "/upload_producto",
        type: "POST",
        data: data,
        success: function(data){
            
            
            
        }
    });*/
});


let autocomplete;
function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('autocomplete'),
        {
            types: ['street_address'],
            componentRestrictions: {'country': ['MX']},
            fields: ['place_id', 'geometry', 'name']
        });

        autocomplete.addListener('place_changed', onPlaceChanged);
}
function onPlaceChanged(){
    var place = autocomplete.getPlace();

    if(!place.geometry){
        document.getElementsById('autocomplete').placeholder = "Ingresa un lugar de salida";
    }else{
        document.getElementsById('details').innerHTML = place.name;
    }
}

initAutocomplete();


//setup before functions
var typingTimer;                //timer identifier
var doneTypingInterval = 1000;  //time in ms, 5 seconds for example
var $input = $('#autocomplete');

//on keyup, start the countdown
$input.on('keyup', function () {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(doneTyping, doneTypingInterval);
});

//on keydown, clear the countdown 
$input.on('keydown', function () {
  clearTimeout(typingTimer);
});

//user is "finished typing," do something
function doneTyping () {
  var data = {};
  data.address = $('#autocomplete').val();

    
}


$('#settings').on('shown.bs.modal', function (e) {
    console.log("I want this to appear after the modal has opened!");

    $.ajax({
        url: "/load_settings",
        type: "GET",
        success: function(data){
            
            if(data.res){

               console.log(data.res[0]);
                
            }
            
        }
    });

  })

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

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});


$("#settings_form").submit(async function(e) {
    e.preventDefault();

    const $form = $("#settings_form");
    const data = getFormData($form);

    console.log( data );

    $.ajax({
        url: "/upload_settings",
        type: "POST",
        data: data,
        success: function(data){
            
            if(data.state == "success"){
                showNotification("success", data.message);
                $("#settings").modal("hide");
            }
            
        }
    });

    
});

$("#nueva_variacion_form").submit(function(e) {
    e.preventDefault();
    const $form = $(this);
    const data = getFormData($form);
    $.ajax({
        url: "/upload_variacion",
        type: "POST",
        data: data,
        success: function(data){
            
            if(data.state == "success"){
                $('#variacion-table').DataTable().clear().draw();
                showNotification("success", data.message);
                $("#nueva_variacion").modal("hide");
                load_variaciones_table();
            }
            
        }
    });
});

function load_producto_table(){
    $.ajax({
        url: "/load_producto_table",
        type: "GET",
        success: function(data){
            
            $('#productos-table').DataTable().rows.add( data.rows ).draw();

        }
    });
}

function load_variaciones_table(){
    $.ajax({
        url: "/load_variaciones_table",
        type: "GET",
        success: function(data){
            
            $('#variacion-table').DataTable().rows.add( data.rows ).draw();

            $('#left_variaciones_column').empty();
            $('#right_variaciones_column').empty();
            data.rows.forEach((variacion,index) => {

                const checkbox = `<div class="form-check form-switch" bis_skin_checked="1">
                                    <input name="${variacion.id}" class="form-check-input" type="checkbox" id="${variacion.id}">
                                    <label class="form-check-label" for="${variacion.id}">${variacion.descripcion}</label>
                                </div>`;

                if(index % 2 == 0){

                    $('#left_variaciones_column').append(checkbox);

                }else{

                    $('#right_variaciones_column').append(checkbox);

                }
            });

        }
    });
}

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

function getFormData($form){
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}
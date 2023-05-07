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





$(document).ready(async function() {
   
});


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

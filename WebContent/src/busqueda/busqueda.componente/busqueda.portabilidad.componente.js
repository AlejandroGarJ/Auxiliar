(function (ng) {


    //Crear componente de busqeuda
    var busquedaPortabilidadComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$rootScope', '$scope', '$location', '$timeout', '$interval', '$window', '$mdDialog', 'validacionesService', 'sharePropertiesService', 'TiposService', 'BusquedaService', 'BASE_SRC', 'MovilService', 'i18nService'],
        require: {
            parent: '^busquedaApp'
        },
        bindings: {
            listBusqueda: '<',
            view: '<',
            dsActive: '<',
            detallesDispositivo: '<'
        }
    }

    busquedaPortabilidadComponent.controller = function busquedaPortabilidadComponentController($rootScope, $scope, $location, $timeout, $interval, $window, $mdDialog, validacionesService, sharePropertiesService, TiposService, BusquedaService, BASE_SRC, MovilService, i18nService) {
        var vm = this;
        var json = {};
        vm.llave = {};
        var url = $location.url();
        vm.numDetalles = [];
        vm.nomDetalles = [];
        var msg = $mdDialog.alert() .clickOutsideToClose(true) .ok('Aceptar');
        vm.isNew = false;
        vm.codprecom = false;

        vm.screenHeight = $window.innerHeight;
        
        //Iniciar el sistema del formulario de busqueda
        this.$onInit = function () {
            vm.active=0;
            vm.vista = 1;
           
            vm.parent.ckPermisos = { EXISTE: true };
    		
    		//Cargar las listas
			if(localStorage.envioMovistar != undefined && localStorage.envioMovistar != ""){
				vm.gridOptions.data = JSON.parse(localStorage.envioMovistar);
				vm.vista = 4;
			}
			else{
				localStorage.clear();
			}			
    	}
    	
    	//Reaccionar los cambios por los componentes
    	this.$onChanges = function(){
    		vm.vista = vm.view;
    		vm.gridOptions.data = vm.listBusqueda;
    		
    		if(vm.gridOptions.data != undefined && vm.gridOptions.data != null && Object.keys(vm.gridOptions.data).length > 0){
	    		vm.active = 0;
    		}else{
    			vm.active = 0;
    		}

            if (vm.vista == 1) {
            	vm.numDetalles = [];
            	vm.nomDetalles = [];
            }
    	}

        this.$doCheck = function () {
            if (vm.gridApi != undefined)
                vm.gridApi.core.resfresh;
        }

        //UI.GRID Configurado
        vm.gridOptions = {
            enableSorting: true,
            enableHorizontalScrollbar: true,
            paginationPageSizes: [15, 30, 50],
            paginationPageSize: 30,
            treeRowHeaderAlwaysVisible: true,
            showGridFooter: true,
            gridFooterTemplate: '<div class="leyendaInferior" style="background-color: rgb(255,0,0); opacity: 0.6;">' +
            						'<div class="contenedorElemento"><a ng-if="grid.appScope.$ctrl.parent.url == \'envios_movistar_main\'" ng-click="grid.appScope.$ctrl.parent.recargarListado()"><md-icon>autorenew</md-icon></a></div>' +
        						'</div>',
        	paginationTemplate: BASE_SRC + 'busqueda/plantillas/plantillaPaginacion.html',
    		data: [],
            columnDefs: [{
                field: 'imei',
                displayName: 'IMEI',width:'15%',
                cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.$ctrl.verDetalle(row.entity, \'resumen\')">{{row.entity.imei}}</a></div>'
            },
            {
                field: 'msisdn',
                displayName: 'MSISDN',width: '12%',
                cellTooltip: function (row) {
                    if (row.entity != undefined)
                        return row.entity.msisdn;
                }
            },
            {
                field: 'brandName',
                displayName: 'Marca',width: '11%',
                cellTooltip: function (row) {
                    if (row.entity != undefined)
                        return row.entity.brandName;
                }
            },
            {
                field: 'modelName',
                displayName: 'Modelo',width: '14%',
                cellTooltip: function (row) {
                    if (row.entity != undefined)
                        return row.entity.modelName;
                }
            },
            {field: 'policyNumber',
            displayName: 'Nº Póliza',width: '11%',
            cellTooltip: function (row) {
                if (row.entity != undefined)
                    if(row.entity.policyNumber == undefined && row.entity.policyId != undefined){ return row.entity.policyNumber ='Prepóliza'} else {return row.entity.policyNumber;} }
            },
            {
                field: 'opComercial',
                displayName: 'Operación comercial',width: '14%',
                cellTooltip: function (row) {
                	if (row.entity != undefined){
                		if(row.entity.opComercial != 1){return row.entity.opComercial;}else{ return row.entity.opComercial = 'ONE_CLICK';}
                	}                      
                }
            },
            {
                field: 'creationUser',
                displayName: 'Creado por',width: '10%',
                cellTooltip: function (row) {
                	if (row.entity != undefined)
                        return row.entity.NO_USU_ALTA;
                }
            },
            {
                field: 'creationDate',
                displayName: 'Creado en',
                cellFilter: 'date:\'dd/MM/yyyy\'',
                width: '10%',
                cellTooltip: function (row) {
                    if (row.entity != undefined)
                        return row.entity.FT_USU_ALTA;
                }
            },
            ],
            onRegisterApi: function (gridApi) {
                vm.gridApi = gridApi;
                vm.gridApi.grid.registerDataChangeCallback(function() {
                    vm.gridApi.treeBase.expandAllRows();
                });

                if(vm.permisos != undefined) {
                    for(var i = 0; i < vm.gridOptions.columnDefs.length; i++) {
                        switch (vm.gridOptions.columnDefs[i].name) {
                            case ' ':
                            case '  ':
                                vm.gridOptions.columnDefs[i].visible = vm.permisos.IN_ESCRITURA;
                                break;
                            case '   ':
                                vm.gridOptions.columnDefs[i].visible = vm.permisos.IN_EXPORTAR;
                                    break;
                            default:
                                break;
                        }
                    }
                }
                vm.parent.translateHeaders(vm.gridOptions);
            }
        }


        //Cargar la plantilla de busqueda
        this.loadTemplate = function() {
            return BASE_SRC + "busqueda/busqueda.view/busqueda.portabilidad.html";
        }

        //Link para ver el detalle viene del Ui-grid  
    	  vm.verDetalle = function (fila, key) {
              vm.llave = {};
              vm.llave = key;
              
  		 	  vm.detallesDispositivo = vm.gridOptions.data.find( data => data.imei == fila.imei);
              vm.cargarDetalle(fila);
          }
            
        //Función para cargar los datos al abrir el tab.
          vm.cargarDetalle = function(fila) {
        	  vm.existe = false;
	          for(var i = 0; i < vm.numDetalles.length; i++){//Mirar si el presupuesto está abierto ya sea resumen, editar o contratar
                  if(fila.imei == vm.numDetalles[i].imei){
	          		  vm.detalles = vm.numDetalles[i];
	          		  vm.existe = true;
	          		  break;
	          	  } else if (vm.nomDetalles[i] == 'nuevo' && vm.numDetalles[i].imei == undefined && fila.imei != undefined) {
	          		  vm.detalles = fila;
	          		  vm.existe = true;
	          		  break;
	          	  }
	          }
	          
              if (!vm.existe) {//Si no está abierto, se abre
              	//Para intercambiar en la misma pestaña
      			if (vm.numDetalles.length > 0) {
      				vm.numDetalles = [];
      				vm.nomDetalles = [];
          			setTimeout( function () { 
  	    				vm.numDetalles.push(fila);
  	    				vm.nomDetalles.push(vm.llave);
  	    				vm.active = vm.numDetalles.length;
      				}, 
          			10);
      			} else {
      				vm.numDetalles.push(fila);
      				vm.nomDetalles.push(vm.llave);
      				vm.active = vm.numDetalles.length;
      			}

                } else {//Si está abierto, se abre el nuevo y se cierra el que estaba abierto, dejando el nuevo en el mismo índice que el cerrado
                    // var index = vm.numDetalles.indexOf(vm.detalles);
                    var index = '';
                    for(var i = 0; i < vm.nomDetalles.length; i++) {
                        if(vm.nomDetalles[i] != 'nuevo') {
                            index = vm.numDetalles.indexOf(vm.detalles);
                        } else {
                            index = i;
                        }
                    }
              	    if (vm.nomDetalles[index]!=vm.llave) {
              		    if (index > -1) {
              			    vm.numDetalles[index] = vm.detalles;
                            vm.nomDetalles[index] = vm.llave;
              		    }
                        vm.active = index + 1;
              	    } else {
              		    vm.active = index + 1;
              	    }
               }		 
          }


        //Boton de cerrar tabs
        vm.cerrarTab = function (tab) {
            var index = vm.numDetalles.indexOf(tab);
            vm.numDetalles.splice(index, 1);
            vm.nomDetalles.splice(index, 1);
        }
    
        
        vm.getTableHeight = function () {
        	var rowHeight = 30; // your row height
            var headerHeight = 30; // your header height
            var footerHeight = 42; // your footer height
            var legendHeight = 30;
            
            var totalItems = vm.gridOptions.totalItems;
            if (totalItems > vm.gridOptions.paginationPageSize) {
            	totalItems = vm.gridOptions.paginationPageSize;
            }
            return {
               height: ((totalItems * rowHeight) + footerHeight + legendHeight + headerHeight) + "px"
            };
        }     
    }

    ng.module('App').component('busquedaPortabilidad', Object.create(busquedaPortabilidadComponent));

})(window.angular);
(function(ng) {	

	//Crear componente de busqueda
    var filtrosUltRecibosComponent = {
    		controllerAs: '$ctrl',
    		template:'<div ng-include="$ctrl.loadTemplate()"></div>',
    		$inject:['$location', 'validacionesService', 'sharePropertiesService', 'BusquedaService', 'TiposService', 'ColectivoService', 'uiGridConstants', 'BASE_SRC','$mdDialog', 'constantsTipos'],
    		require: {
            	parent:'^filtrosApp',
                filtro:'^busquedaApp',
                parentApp: '^sdApp'
            }
    } 
    
    filtrosUltRecibosComponent.controller = function filtrosUltRecibosComponentController($location, $routeParams, sharePropertiesService, BusquedaService, TiposService, ColectivoService, uiGridConstants, BASE_SRC,$mdDialog, constantsTipos){
    	var vm=this;
    	var json = {};
    	vm.vista = 1;
		vm.tipos = {};
		vm.colectivos = {};
    	vm.calendar = {};
		vm.desplegado = true;
		vm.productosMulti = [];
		vm.selectedmodelProductos = [];
		vm.settingsDropdown = { selectedToTop: true, checkBoxes: true, scrollableHeight: '140px', scrollable: true, enableSearch: true, showCheckAll: false };
		vm.settingsDropdownText = { buttonDefaultText: 'Subproductos', checkAll: "", uncheckAll: "Deseleccionar todo", searchPlaceholder: "Subproductos", dynamicButtonTextSuffix: "seleccionados" };
		vm.eventsDropdown = {
			onSelectionChanged: function (item) { vm.onSelectionChanged(item) }
    	}
		vm.busquedaAvanazda = false;
        vm.basicSearch = false;
    	
    	//Iniciar el sistema del formulario de busqueda
    	this.$onInit = function(){
    		var usuario = vm.parent.perfil;
    		
            vm.tipos.programa = [];
            vm.tipos.productos = [];
            vm.tipos.colectivosProducto = [];
            var idProgramaUrl = vm.parent.getUrlParam('idPrograma', $location.url());
            
            var perfil = sessionStorage.getItem('perfil');

            vm.tipos.colectivosProducto = vm.parent.getEstructuraColectivo();
            var colectivosGrouped = vm.parent.groupColectivos(vm.tipos.colectivosProducto, "ID_TIPOCOLECTIVO_PADRE");
            vm.tipos.colectivosProducto = vm.parent.sortColectivos(colectivosGrouped);
            
            vm.productosMulti = JSON.parse(JSON.stringify(vm.tipos.productos));
            
            if (perfil != null) {
                perfil = JSON.parse(perfil);
                if (perfil.productos != null && perfil.productos.length > 0) {
                    var programa = null;
                    
                    for (var i = 0; i < perfil.productos.length; i++) {
                        var programa = perfil.productos[i];
                        
                        //Añadimos el producto
                        vm.tipos.productos.push({
                            ID_PRODUCTO: programa.ID_PRODUCTO,
                            DS_PRODUCTO: programa.DS_PRODUCTO,
                            NO_PRODUCTO: programa.NO_PRODUCTO,
                            ID_PROGRAMA: programa.ID_PROGRAMA,
                            DS_PROGRAMA: programa.DS_PROGRAMA,
                            ID_TIPO_POLIZA: programa.ID_TIPO_POLIZA,
                            DS_TIPO_POLIZA: vm.parent.getDsColectivo(programa.ID_TIPO_POLIZA)
                        });
                        
                        //Añadir al listado de productos múltiples
                        if (vm.productosMulti.findIndex(x => x.id == programa.ID_PRODUCTO) == -1) {
							vm.productosMulti.push({
								id: programa.ID_PRODUCTO,
								label: programa.NO_PRODUCTO,
								ID_TIPO_POLIZA: programa.ID_TIPO_POLIZA,
								DS_TIPO_POLIZA: vm.parent.getDsColectivo(programa.ID_TIPO_POLIZA)
							});
    		    		}
                        
                        //Comprobamos si el programa está ya en la lista. Si no está, se añade
                        var existePrograma = vm.tipos.programa.findIndex(x => x.ID_PROGRAMA == programa.ID_PROGRAMA);
                        if (existePrograma == -1) {
                            vm.tipos.programa.push({
                                ID_PROGRAMA: programa.ID_PROGRAMA,
                                DS_PROGRAMA: programa.DS_PROGRAMA
                            })
                        }
                        
                    }

                    if (vm.tipos.programa.length == 1) {
                        vm.ID_PROGRAMA = [];
                        vm.ID_PROGRAMA.push(vm.tipos.programa[0].ID_PROGRAMA);
                        vm.changePrograma();
                    }
                }
            }
            
            if(vm.parentApp.listServices.listCanales != null && vm.parentApp.listServices.listCanales.length > 0) {
    			vm.canales = vm.parentApp.listServices.listCanales;
    		} else {
    			TiposService.getTipos({"ID_CODIGO": constantsTipos.CANALES})
				.then(function successCallback(response){
					if(response.status == 200){
						vm.canales = response.data.TIPOS.TIPO;
						vm.parentApp.listServices.listCanales = vm.canales;
					}
				}, function callBack(response){
					if(response.status == 406 || response.status == 401){
						vm.parent.logout();
					}
				});
			}
    		
    		if(vm.parentApp.listServices.listCompanias != null && vm.parentApp.listServices.listCompanias.length > 0){
    			vm.tipos.compania = vm.parentApp.listServices.listCompanias;
    		} else {
    			TiposService.getCompania({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.compania = response.data.TIPOS.TIPO;
    					vm.parentApp.listServices.listCompanias = vm.tipos.compania;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.parent.logout();
                    }
    			});
    		}
    		
    		if(vm.parentApp.listServices.listRamos != null && vm.parentApp.listServices.listRamos.length > 0){
    			vm.tipos.ramos = vm.parentApp.listServices.listRamos;
    		} else {
    			TiposService.getRamos({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.ramos = response.data.TIPOS.TIPO;
    					vm.parentApp.listServices.listRamos = vm.tipos.ramos;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.parent.logout();
                    }
    			});
    		}
    		
    		if(vm.parentApp.listServices.listMedioPago != null && vm.parentApp.listServices.listMedioPago.length > 0){
    			vm.tipos.pago = vm.parentApp.listServices.listMedioPago;
    		} else {
    			TiposService.getMedioPago({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.pago = response.data.TIPOS.TIPO;
    					vm.parentApp.listServices.listMedioPago = vm.tipos.pago;
    				}
    			});
    		}
    		
    		if(vm.parentApp.listServices.listSituaRecibo != null && vm.parentApp.listServices.listSituaRecibo.length > 0){
    			vm.tipos.situaRecibo = vm.parentApp.listServices.listSituaRecibo;
    		} else {
    			TiposService.getSituaRecibo({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.situaRecibo = response.data.TIPOS.TIPO;
    					vm.parentApp.listServices.listSituaRecibo = vm.tipos.situaRecibo;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.parent.logout();
                    }
    			});
    		}
    		
    		if(vm.parentApp.listServices.listTiposRecibo != null && vm.parentApp.listServices.listTiposRecibo.length > 0){
    			vm.tipos.tiposRecibo = vm.parentApp.listServices.listTiposRecibo;
    		} else {
    			TiposService.getTiposRecibo()
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.tipos.tiposRecibo = response.data.TIPOS.TIPO;
    					vm.parentApp.listServices.listTiposRecibo = vm.tipos.tiposRecibo;
    				}
    			}, function callBack(response){
    				if(response.status == 406 || response.status == 401){
                    	vm.parent.logout();
                    }
    			});
    		}
    		
    		// if(vm.parentApp.listServices.listColectivos != null && vm.parentApp.listServices.listColectivos.length > 0){
    		// 	vm.colectivos = vm.parentApp.listServices.listColectivos;
    		// } else {
    		// 	ColectivoService.getListColectivos({})
    		// 	.then(function successCallback(response){
    		// 		if(response.status == 200){
    		// 			vm.colectivos = response.data.COLECTIVOS.COLECTIVO;
    		// 			vm.parentApp.listServices.listColectivos = vm.colectivos;
    		// 		}
    		// 	}, function callBack(response) {
    		// 		if(response.status == 406 || response.status == 401){
    		// 			vm.parent.logout();
    		// 		}
    		// 	});
			// }
			vm.colectivos = JSON.parse(window.sessionStorage.perfil).colectivos;
			
			if(vm.parentApp.listServices.listProductos != null && vm.parentApp.listServices.listProductos.length > 0) {
    			vm.productos = vm.parentApp.listServices.listProductos;
    		} else {
    			TiposService.getProducto({})
    			.then(function successCallback(response){
    				if(response.status == 200){
    					vm.productos = response.data.TIPOS.TIPO;
    					vm.parentApp.listServices.listProductos = vm.productos;
    				}
    			}, function callBack(response) {
    				if(response.status == 406 || response.status == 401){
    					vm.parent.logout();
    				}
    			});
			}

    		//Comprobarsi existe el idPrograma en la url
            if (idProgramaUrl != null && idProgramaUrl != "") {
            	vm.ID_PROGRAMA = [];
            	vm.ID_PROGRAMA.push(parseInt(idProgramaUrl));
            	vm.changePrograma();
            }
    	}
    	
    	//Abrir el calendario
    	vm.openCalendar = function(key){
    		vm.calendar[key] = true;
    	}

    	//Cargar la plantilla de busqueda
    	this.loadTemplate=function(){
    		return BASE_SRC+"filtros/filtros.view/filtros.ultRecibos.html";
    	}
    	
    	vm.buscar = function(tipo){
			setTimeout(function() {
				angular.forEach(vm.form, function(value, key) {
						if(value.value == "" || value.value==null){
							delete vm.form[key];
						}
					});
				if(vm.parent.filtrar(vm.form, tipo)){
					var msg = $mdDialog.alert()
						.clickOutsideToClose(true)
						.textContent('Es obligatorio rellenar un campo para realizar la búsqueda')
						.ok('Aceptar');
					$mdDialog.show(msg);
	//                $mdDialog.show({
	//    			templateUrl: BASE_SRC+'filtros/filtros.error.html',
	//    			controllerAs: '$ctrl',
	//    			clickOutsideToClose:true,
	//    			parent: angular.element(document.body),
	//    		    fullscreen:false,
	//    		    controller:['$mdDialog', function($mdDialog){
	//    		    	var md = this;
	//    	    	    md.cancel = function() {
	//    	    	      $mdDialog.cancel();
	//    	    	    };
	//                }]
	//    		});
				} else {
					vm.desplegado = false;
                    vm.basicSearch = true;
				}
			}, 1000);
        }
    	
    	//Limpiar formulario
    	vm.limpiar = function(){
    		vm.form = vm.parent.removeForm(vm.form);
            vm.selectedmodelProductos = [];
            vm.ID_PROGRAMA = [];
    		if (vm.filtro != null) {
    			vm.filtro.vista = 1;
    			vm.desplegado = true;
    		}
    	}
		
		vm.desplegar = function () {
			vm.desplegado = !vm.desplegado;
            vm.showCamposBusqueda = !vm.showCamposBusqueda;
		}
		
        vm.showBasicSearch = function () {
            vm.desplegado = true;
            vm.basicSearch = !vm.basicSearch;
        }
        
		vm.cambiarBusquedaAvanzada = function () {
			vm.busquedaAvanazda = !vm.busquedaAvanazda;
		}
        
        vm.changeColectivos = function (colectivo) {
            if (vm.form == null) {
                vm.form = {};
            }

            if (vm.form.LST_ID_TIPO_POLIZA == null) {
                vm.form.LST_ID_TIPO_POLIZA = {
                    value: []
                }
            }

            //Si hemos seleccionado un colectivo padre
            if (colectivo.IS_PADRE == true) {

                //Si el colectivo ya estaba añadido, lo deseleccionamos y deseleccionamos los hijos
                if (vm.form.LST_ID_TIPO_POLIZA.value != null && vm.form.LST_ID_TIPO_POLIZA.value.includes(colectivo.ID_TIPO_POLIZA)) {
                    var index = vm.form.LST_ID_TIPO_POLIZA.value.findIndex(x => x == colectivo.ID_TIPO_POLIZA);
//                    vm.form.LST_COLECTIVOS.value.slice(index, 1);

                    //Recorremos los colectivos para encontrar los hijos y eliminarlos de la listaColectivo
                    for (var i = 0; i < vm.tipos.colectivosProducto.length; i++) {
                        if (vm.tipos.colectivosProducto[i].IS_PADRE != true && vm.tipos.colectivosProducto[i].ID_TIPOCOLECTIVO_PADRE == colectivo.ID_TIPO_POLIZA && vm.form.LST_ID_TIPO_POLIZA.value.includes(vm.tipos.colectivosProducto[i].ID_TIPO_POLIZA)) {
                            var indexHijo = vm.form.LST_ID_TIPO_POLIZA.value.findIndex(x => x == vm.tipos.colectivosProducto[i].ID_TIPO_POLIZA);
                            vm.form.LST_ID_TIPO_POLIZA.value.splice(indexHijo, 1);
                        }
                    } 
                } 
                //Si no está añadido a la lista, se añade y se seleccionan todos sus hijos
                else {
//                    vm.form.LST_COLECTIVOS.value.push(colectivo.ID_TIPO_POLIZA);

                    //Recorremos los productos para encontrar sus hijos y añadirlos
                    for (var i = 0; i < vm.tipos.colectivosProducto.length; i++) {
                        if (vm.tipos.colectivosProducto[i].IS_PADRE != true && vm.tipos.colectivosProducto[i].ID_TIPOCOLECTIVO_PADRE == colectivo.ID_TIPO_POLIZA && !vm.form.LST_ID_TIPO_POLIZA.value.includes(vm.tipos.colectivosProducto[i].ID_TIPO_POLIZA)) {
                            vm.form.LST_ID_TIPO_POLIZA.value.push(vm.tipos.colectivosProducto[i].ID_TIPO_POLIZA);
                        }
                    } 
                }
            } else {
                if (vm.form.LST_ID_TIPO_POLIZA.value.includes(colectivo.ID_TIPO_POLIZA) && vm.form.LST_ID_TIPO_POLIZA.value.includes(colectivo.ID_TIPOCOLECTIVO_PADRE)) {
                    var indexColectivoPadre = vm.form.LST_ID_TIPO_POLIZA.value.findIndex(x => x == colectivo.ID_TIPOCOLECTIVO_PADRE);
                    vm.form.LST_ID_TIPO_POLIZA.value.splice(indexColectivoPadre, 1);
                }
            }
        }
        
        vm.changePrograma = function () {
    		if (vm.ID_PROGRAMA != null && vm.tipos.productos != null) {
				vm.selectedmodelProductos = [];
				vm.productosMulti = [];
				vm.tipos.colectivosProducto = [];
    			for (var i = 0; i < vm.tipos.productos.length; i++) {
    				var producto = vm.tipos.productos[i];
    				
    				if (vm.ID_PROGRAMA.includes(producto.ID_PROGRAMA)) {
    					
    					if (vm.productosMulti.findIndex(x => x.id == producto.ID_PRODUCTO) == -1) {
	    					vm.productosMulti.push({
	    						id: producto.ID_PRODUCTO,
		                        label: producto.NO_PRODUCTO,
		                        ID_TIPO_POLIZA: producto.ID_TIPO_POLIZA,
		                        DS_TIPO_POLIZA: vm.parent.getDsColectivo(producto.ID_TIPO_POLIZA)
	    					});
    					}
    					
    					if (vm.selectedmodelProductos.findIndex(x => x.id == producto.ID_PRODUCTO) == -1) {
	    					vm.selectedmodelProductos.push({
	    						id: producto.ID_PRODUCTO,
		                        label: producto.DS_PRODUCTO
	    					});
    					}
    					

    					//Añadimos los colectivos
    					if (vm.tipos.colectivosProducto.findIndex(x => x.ID_TIPO_POLIZA == producto.ID_TIPO_POLIZA) == -1) {
    						var obj = {
        		    			ID_TIPO_POLIZA: producto.ID_TIPO_POLIZA,
        		    			DS_TIPO_POLIZA: vm.parent.getDsColectivo(producto.ID_TIPO_POLIZA),
        		    			ID_PRODUCTO: producto.ID_PRODUCTO,
        		    			DS_PRODUCTO: producto.DS_PRODUCTO
        		    		};

        		    		var colectivoPadre = vm.parent.getColectivoPadre(producto.ID_TIPO_POLIZA);
        		    		if (colectivoPadre.ID_TIPOCOLECTIVO_PADRE == undefined) {
        		    			obj.IS_PADRE = true;
                                obj.ID_TIPOCOLECTIVO_PADRE = colectivoPadre.ID_TIPO_POLIZA;
        		    		} else {
        		    			obj.ID_TIPOCOLECTIVO_PADRE = colectivoPadre.ID_TIPOCOLECTIVO_PADRE;
        		    		}
        		    		
        		    		if (vm.tipos.colectivosProducto.findIndex(x => x.ID_TIPO_POLIZA == producto.ID_TIPO_POLIZA) == -1) {
            		    		vm.tipos.colectivosProducto.push(obj);
        		    		}
        		    		
        		    		if (obj.IS_PADRE != true && colectivoPadre != null && vm.tipos.colectivosProducto.findIndex(x => x.ID_TIPO_POLIZA == colectivoPadre.ID_TIPOCOLECTIVO_PADRE) == -1) {
        		    			vm.tipos.colectivosProducto.push({
                                    ID_TIPOCOLECTIVO_PADRE: colectivoPadre.ID_TIPOCOLECTIVO_PADRE,
            		    			ID_TIPO_POLIZA: colectivoPadre.ID_TIPOCOLECTIVO_PADRE,
            		    			DS_TIPO_POLIZA: colectivoPadre.DS_TIPO_POLIZA_PADRE,
            		    			ID_PRODUCTO: producto.ID_PRODUCTO,
            		    			DS_PRODUCTO: producto.DS_PRODUCTO,
            		    			IS_PADRE: true
            		    		});
        		    		}
    					}
    				}
    			}
    			
                var colectivosGrouped = vm.parent.groupColectivos(vm.tipos.colectivosProducto, "ID_TIPOCOLECTIVO_PADRE");
                vm.tipos.colectivosProducto = vm.parent.sortColectivos(colectivosGrouped);
    		} else {
    			vm.selectedmodelProductos = [];
				vm.productosMulti = [];
				vm.tipos.colectivosProducto = [];
				vm.tipos.colectivosProducto = vm.parent.getEstructuraColectivo();
                var colectivosGrouped = vm.parent.groupColectivos(vm.tipos.colectivosProducto, "ID_TIPOCOLECTIVO_PADRE");
                vm.tipos.colectivosProducto = vm.parent.sortColectivos(colectivosGrouped);
    		}

            if (vm.form == undefined) {
                vm.form = {};
            }
    		vm.form.LST_ID_TIPO_POLIZA = {
				value: []
			}
    		vm.onSelectionChanged();
    	}
        
        vm.onSelectionChanged = function (item) {
			if (vm.form == undefined) {
				vm.form = {};
			}
    		if (vm.form.LST_PRODUCTOS == undefined) {
    			vm.form.LST_PRODUCTOS = {
    					value: []
    			};
    		} else {
    			vm.form.LST_PRODUCTOS.value = [];
    		}
    		vm.settingsDropdownText.dynamicButtonTextSuffix = "";

    		if (vm.selectedmodelProductos != null && vm.selectedmodelProductos.length > 0) {
    			for (var i = 0; i < vm.selectedmodelProductos.length; i++) {
    				
    				if (!vm.form.LST_PRODUCTOS.value.includes(vm.selectedmodelProductos[i].id)) {
        				vm.form.LST_PRODUCTOS.value.push(vm.selectedmodelProductos[i].id);
    				}
    			}
    		} else {
    			vm.form.LST_PRODUCTOS.value = [];
                vm.ID_PROGRAMA = [];
        		vm.tipos.colectivosProducto = JSON.parse(window.sessionStorage.perfil).colectivos;
        		vm.tipos.colectivosProducto = vm.parent.getEstructuraColectivo();
                var colectivosGrouped = vm.parent.groupColectivos(vm.tipos.colectivosProducto, "ID_TIPOCOLECTIVO_PADRE");
                vm.tipos.colectivosProducto = vm.parent.sortColectivos(colectivosGrouped);
    		}
    	}
        
        vm.changeSubproducto = function () {

            //Comprobar si se han deseleccionado todos los subproductos de algún producto seleccionadofor (var i = 0; i < vm.tipos.productos.length; i++) {
            for (var j = 0; j < vm.ID_PROGRAMA.length; j++) {
                var deseleccionarPrograma = true;

                for (var i = 0; i < vm.tipos.productos.length; i++) {
                    var producto = vm.tipos.productos[i];

                    if (vm.form != null && vm.form.LST_PRODUCTOS != null && vm.form.LST_PRODUCTOS.value != null) {
                        //Si deseleccionamos todos los subproductos de X producto, desaparece el producto del filtro. Si volvemos a añadir algún subproducto, se añade el `producto al filtro
                        if (vm.form.LST_PRODUCTOS.value.findIndex(x => x == producto.ID_PRODUCTO) > -1 && !vm.ID_PROGRAMA.includes(producto.ID_PROGRAMA)) {
                            vm.ID_PROGRAMA.push(producto.ID_PROGRAMA);
                        }
                        
                        if (vm.ID_PROGRAMA[j] == producto.ID_PROGRAMA) {
                            if (vm.form.LST_PRODUCTOS.value.findIndex(x => x == producto.ID_PRODUCTO) > -1) {
                                deseleccionarPrograma = false;
                            }
                        }
                    }
                }

                if (deseleccionarPrograma == true) {
                    vm.ID_PROGRAMA.splice(j, 1);
                    j--;
                }
            }
        }
    	
    }    
    ng.module('App').component('filtrosUltrecibosApp', Object.create(filtrosUltRecibosComponent));    
})(window.angular);
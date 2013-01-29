/**
 *  Copyright (C) 2007 - 2012 GeoSolutions S.A.S.
 *  http://www.geo-solutions.it
 *
 *  GPLv3 + Classpath exception
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @author Lorenzo Natali
 */

/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = CropStatus
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins.nrl");

/** api: constructor
 *  .. class:: CropStatus(config)
 *
 *    Plugin for adding NRL CropData Module to a :class:`gxp.Viewer`.
 */   
gxp.plugins.nrl.CropData = Ext.extend(gxp.plugins.Tool, {
 /** api: ptype = nrl_crop_data */
    ptype: "nrl_crop_data",
	/** i18n **/
	outputTypeText:'Output Type',
	seasonText:'Season',
	/** layer Name **/
    hilightLayerName:"CropData_Selection_Layer",//TODO doesn't seems to run
	layerStyle:{
        strokeColor: "red",
        strokeWidth: 1,
        fillOpacity:0.6,
        cursor: "pointer"
    },
    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config) {
		var conf = {
			//TODO year ranges (from available data)
			
		}
	
	
		var cropData  = {
			xtype:'form',
			title: 'Crop Data',
			layout: "form",
			minWidth:180,
			autoScroll:true,
			frame:true,
			items:[
			
				{ 
					fieldLabel: this.outputTypeText,
					xtype: 'checkboxgroup',
					anchor:'100%',
					autoHeight:true,
					checkboxToggle:true,
					//title: ,
					autoHeight: true,

					defaultType: 'radio', // each item will be a radio button
					items:[
						{boxLabel: 'Data' , xtype:'radio', name: 'outputtype', inputValue: 'data'},
						{boxLabel: 'Chart', xtype:'radio', name: 'outputtype', inputValue: 'chart', checked: true},
						{boxLabel: 'Map'  , xtype:'radio', name: 'outputtype', inputValue: 'map'}
						
					]
				},{ 
					fieldLabel: this.seasonText,
					xtype: 'nrl_seasonradiogroup',
					anchor:'100%',
					ref:'season',
					listeners: {
						
						select: function(group,checked){
							//TODO (smart check if commodity is present in the filtered combo)
							this.ownerCt.Commodity.setValue(this.startValue)
							this.ownerCt.Commodity.seasonFilter(checked.inputValue);  //check it : first time dosn't run
							
						}
					}
				},{
					xtype: 'nrl_aoifieldset',
					ref:'aoiFieldSet',
                    layerStyle:this.layerStyle,
					anchor:'100%',
					target:this.target,
					hilightLayerName:this.hilightLayerName,
					layers:{
						DISTRICT:'nrl:District_Boundary',
						PROVINCE:'nrl:Province_Boundary'
					}
					
				},
				{
					xtype: 'nrl_commoditycombobox',
					anchor:'100%',
					ref: 'Commodity'
					
					
				},{
					xtype: 'label',
					anchor:'100%',
					fieldLabel:'Reference Year',
					text:2012, //TODO conf
					ref: 'referenceYear'
				},{
					ref: 'yearRangeSelector',
					xtype: 'yearrangeselector',
					anchor:'100%',
					maxValue: 2012, //TODO conf
					minValue: 1992, //TODO conf
					values:[2008,2012], //TODO conf
					listeners:{
						scope:this,
						change:function(start,end){
							this.output.referenceYear.setText(end);
							
						}
					}
					
				},{ 
					fieldLabel: 'Variable',
					xtype: 'checkboxgroup',
					anchor:'100%',
					autoHeight:true,
					//checkboxToggle:true,
					title: this.outputTypeText,
					autoHeight: true,
					defaultType: 'radio',
					columns: 1,
					items:[
						{boxLabel: 'Area' , name: 'variable', inputValue: 'Area'},
						{boxLabel: 'Production', name: 'variable', inputValue: 'Production', checked: true},
						{boxLabel: 'Yield' , name: 'variable', inputValue: 'Yield'}
						
					]
				},{
					xtype: 'fieldset',
					title:'Unit',
					anchor:'100%',
					items:[{
							xtype: 'combo',
							anchor:'100%',
							fieldLabel: 'Production',
							typeAhead: true,
							triggerAction: 'all',
							lazyRender:false,
							mode: 'local',
							autoLoad:true,
							
							
							
							displayField: 'label',
							valueField:'name'
						},{
							xtype: 'combo',
							anchor:'100%',
							fieldLabel: 'Area',
							typeAhead: true,
							
							triggerAction: 'all',
							lazyRender:false,
							mode: 'local',
							autoLoad:true,
							
							displayField: 'label',
							valueField:'name'
					}]
				  
					
				}
			
				
			],	
			buttons:[{
                text:'compute',
                xtype: 'gxp_nrlChartButton',
                target:this.target
                /*handler:function(){
						Ext.Msg.alert("Add Area","Not Yet Implemented");
				}*/
            }]
			

		};
		
		config = Ext.apply(cropData,config || {});
		
		this.output = gxp.plugins.nrl.CropData.superclass.addOutput.call(this, config);
		
		//hide selection layer on tab change
		this.output.on('beforehide',function(){
			var button = this.output.aoiFieldSet.AreaSelector.selectButton;
			button.toggle(false);
			var lyr = button.hilightLayer;
			if(!lyr) return;
			lyr.setVisibility(false);
			
		},this);
		this.output.on('show',function(){
			var button = this.output.aoiFieldSet.AreaSelector.selectButton;
			
			var lyr = button.hilightLayer;
			if(!lyr) return;
			lyr.setVisibility(true);
			
		},this);
		return this.output;
	}
 });
 Ext.preg(gxp.plugins.nrl.CropData.prototype.ptype, gxp.plugins.nrl.CropData);
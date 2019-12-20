/**
	MHE Content Tool Open API v3.0.1
	
	YOU MAY NOT EDIT THIS SCRIPT!!!
	
	jQuery 1.3.2 or better required!!!
	Authors:	Malcolm Duncan  W.Malcolm.Duncan@mheducation.com  wmd@clearlearning.com
				Chris Patterson
				EZTOOL Team -> HEART Team
*/

/* uncomment to degrade domain to lowest common denomination for testing off localhost
var dName = document.domain;
if ((dName.indexOf(".com") > -1) && (dName.indexOf(".") > -1)) {
	var temp = dName.split(".");
	dName = temp[temp.length - 2] + "." + temp[temp.length - 1];
}
//alert('rig base domain: ' + dName);
document.domain= dName;
*/


var EZ = {

	API_VERSION:		"3.0.1",
	
	MODE_PREVIEW: 		"preview",	// mode showing correct answers in place
	MODE_TEST:			"test",		// standard student mode
	MODE_PREGRADE:		"sample",	// mode to pregrade only items answered
	MODE_POST_TEST:		"review",	// mode to fully grade/score the object
	MODE_DESIGN:		"design",	// mode to edit the object

	id:					"", 		// external identifier from consumer
	qid:				"", 		// parent question identifier from consumer
	instanceid:			"", 		// unique identifier from consumer
	mode:				"", 		// rendering mode from consumer
	state:				"", 		// initial state from consumer
	response:			"", 		// initial state from consumer
	randoms:			[],			// random variables from consumer
	mediaUrls:			[],			// associated media from consumer
	mediaBase:			"",			// baseURL from consumer
	debug:				true,		// set true to see debug alerts
	isApiCallQueued:  	false, 		// to determine if any api call is in queue

	dcr:			 	"=;()_&abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
	ncr:			 	"aeiouy0123QRST67JKEFGH45=MN;pqrs(fgh)lmnvwx89_jk&bcdtzABCDILXYZOPUVW",
	

	// reach across the iframe boundary to the host page to get data
	getParentVarByID: function( varname )
	{
		var result= "";
		
		try
		{
			if (parent.ex_get_varByID)
				result= parent.ex_get_varByID( varname );
			else
				this.log("EZ.getParentVarByID() - no ex_get_varByID in parent");
		}
		catch (err)
		{
			this.log("EZ.getParentVarByID() - exception " + err);
		}
	
		return result;
	},
	
	// reach across the iframe boundary to the host page to get data
	getParentVarByName: function( name )
	{
		var result= "";
		
		try
		{
			if (parent.ex_get_varByName)
				result= parent.ex_get_varByID( name );
			else
				this.log("EZ.getParentVarByName() - no ex_get_varByName in parent");
		}
		catch (err)
		{
			this.log("EZ.getParentVarByName() - exception " + err);
		}
	
		return result;
	},
	
	log: function(str)
	{
		if (this.debug)
		{
			// Use Firebug, Safari debugger, or other external console object if available.
			if (console && console.log)
				console.log(str);
			else
				window.status = str;
		}
	},
	
	error: function(str)
	{
		if (this.debug)
		{
			// Use Firebug, Safari debugger, or other external console object if available.
			if (console && console.log)
				console.log(str);
			else
				window.alert(str);
		}
	},
	
	/*
		Get everything necessary to instantiate a tool and then do so.  We look for setStateResponse()
		here and prefer it over setState() unless we explicitly choose to force setState() by setting
		the force_combined policy.
	*/
	init: function() 
	{
		this.log("EZ.init()");
		
		this.id= window.name;
		
		if (this.id != "")
		{
			var part= this.id.split('_');
			this.qid= part[0] + '_' + part[1];
			
			this.mode = this.getParentVarByID(this.id + '_mode');
			this.state= this.getParentVarByID(this.id + '_state');
			this.response= this.getParentVarByID(this.id + '_response');
			this.instanceid= this.getParentVarByID(this.id + '_instanceid');
			this.loadRandoms();
			this.randomSubstitutions();
			this.loadMediaReferences();
		
			this.log("  id         : " + this.id);
			this.log("  qid        : " + this.qid);
			this.log("  instanceid : " + this.instanceid);
			this.log("  mode       : " + this.mode);
			this.log("  state      : " + this.state);
			this.log("  response   : " + this.response);
						
			try
			{
				if (typeof setStateResponse === 'function') // separated state/response API calls are supported
				{
					if (this.getParentVarByID('force_combined' ) == "true") setState( this.state );
					else setStateResponse( this.state, this.response );
				}
				else setState( this.state );
			}
			catch (e)
			{
				this.error("Error calling external setState method; is it implemented?" + e);
			}
		}
		else this.error("empty tool id");
	},
    getOnDemandSaveInterval: function() {
        return parseInt(this.getParentVarByID("onDemandSaveTime"))
    },
    getOnDemandExtendedSaveInterval: function() {
        return parseInt(this.getParentVarByID("onDemandExtendedSaveTime"))
	},
	getKey : function() {
		return this.getParentVarByID(this.id + '_key' );
	},

	/*
		Call the host page to save the current state and/or response to the tool.  Here's where
		we test for the existence of getResponse() and prefer triggering a response alone save
		versus a combined state save unless we explicitly override it by force_combined policy.
	*/ 
	save: function()
	{
		try
		{
			var saveResponseAlone= false;
			
			if (typeof getResponse === 'function') // separated state/response API calls are supported
			{
				this.response= getResponse();
				if ((this.getParentVarByID('force_combined' ) != "true") && (typeof parent.ex_trigger_saveResponse === 'function')) saveResponseAlone= true;
			}
			
			this.log("EZ.save() " + (saveResponseAlone ? "separated response" : "combined state"));
			
			if (saveResponseAlone)
				parent.ex_trigger_saveResponse( this.mode, this.id );
			else if (typeof parent.ex_trigger_save === 'function')
				parent.ex_trigger_save( this.mode, this.id );
			else
		    	this.log("EZ.save() - no ex_trigger_save in parent");
		}
		catch (err)
		{
			this.log("EZ.save() - exception " + err);
		}
		
		return;
	},
		
	retrieveResults: function( callback )
	{
		try
		{
			parent.ex_trigger_retrieveResults( this.mode, this.id, callback );
		}
		catch (err)
		{
			this.log("EZ.returnResults() - exception " + err);
		}
		
		return;
	},
		
	resize: function(width, height) 
	{
		this.log("EZ.resize(" + width + ", " + height + ")");
		
		try
		{
			if (parent.ex_resize)
				result= parent.ex_resize( this.id, width, height );
			else
				this.log("EZ.resize() - no ex_resize in parent");
		}
		catch (err)
		{
			this.log("EZ.resize() - exception " + err);
		}
	},
	
	policy: function(name) 
	{
		this.log("EZ.policy(" + name + ")");
		
		return ( this.getParentVarByID( name ) );
	},
	
	param: function(name) 
	{
		this.log("EZ.param(" + name + ")");
		
		return ( this.getParentVarByName( name ) );
	},
	
	instance: function() 
	{
		this.log("EZ.instance()");
		
		return ( this.instanceid );
	},
	
	loadRandoms: function ()
	{
		this.log("EZ.loadRandoms()");
		
		try
		{
			this.randoms = [];			
			var sourceRandoms= this.getParentVarByID( this.qid + '_rnd');
			if (sourceRandoms != '')
			{
				if (sourceRandoms.substring(0,3) == '%%1')
				{
					var input= sourceRandoms.substring(3); 
					sourceRandoms= "";
					
					for (var i=0; i < input.length; i++)
					{
						var ch= input.charAt(i);
						var ndx= this.ncr.indexOf(ch);
						if (ndx < 0) sourceRandoms += ch;
						else sourceRandoms += this.dcr.charAt(ndx);
					}
				}
				
				var randomArray= sourceRandoms.split(';');
				for (i=0; i<randomArray.length; i++)
				{
					var thisVar= randomArray[i].split('=');
					if (thisVar.length == 2)
					{
						this.randoms.push( { name: thisVar[0], value: thisVar[1] } );
					}
				}
			}
		}
		catch (e) 
		{
			this.error("Error loading external random variables: " + e);
		};
	},
	
	random: function(varname)
	{
		this.log("EZ.random(" + varname + ")");
		
		for (i=0; i<this.randoms.length; i++)
		{
			var rv = this.randoms[i];
			if (rv.name == varname) return(rv.value);
		}
		return null;
	},
	
	randomSubstitutions: function ()
	{
		this.log("EZ.randomSubstitutions()");
		
		// Dereference this.randoms so we can use it within $.each() below.
		var r = this.randoms;
		
		if (r.length == 0) return;
		
		$('.ez_random').each( function(ndex){
			var content= $(this).html();
			if (content == null) return;
			if (content.length == 0) return;
	
			//EZ.log("ez_random " + ndex + " content before substitutions:");
			//EZ.log(content);
			
			var result= content;
			for (i=0; i<r.length; i++)
			{
				var rv = r[i];
				var name= rv.name;
				var value= rv.value;
				result= result.split('\[' + name + '\]').join(value);
			}
			$(this).html(result);
			
			//EZ.log("ez_random " + ndex + " content after substitutions:");
			//EZ.log(result);
		});
	},
	
	contactPublisher: function( message )
	{
		this.log("EZ.contactPublisher()");
		
		try
		{
			if (parent.ex_trigger_contact)
				parent.ex_trigger_contact( this.mode, this.qid, message );
			else
				this.log("EZ.contactPublisher() - no ex_trigger_contact in parent");
		}
		catch (err)
		{
			this.log("EZ.contactPublisher() - exception " + err);
		}
		
		return;
	},
	
	media: function(mediaName)
	{
		this.log("EZ.media(" + mediaName + ")");
		
		return this.mediaBase + mediaName;
	},
	
	loadMediaReferences: function ()
	{
		this.log("EZ.loadMediaReferences()");

		try
		{
			this.mediaUrls = [];
			
			var sourceMedia= this.getParentVarByID( this.qid + '_media');

			if (sourceMedia != '')
			{
				var mediaArray= sourceMedia.split(',');
				if (mediaArray.length > 1)
				{
					this.mediaBase= mediaArray[0];
					for (i=1; i<mediaArray.length; i++)
						this.mediaUrls.push(mediaArray[i]);
				}
			}
		}
		catch (e) 
		{
			this.error("Error loading external media references: " + e);
		};		
	}
};

var	MODE_PREVIEW 		= EZ.MODE_PREVIEW;		// mode showing correct answers in place
var	MODE_TEST			= EZ.MODE_TEST;			// standard student mode
var	MODE_PREGRADE		= EZ.MODE_PREGRADE;		// mode to pregrade only items answered
var	MODE_POST_TEST		= EZ.MODE_POST_TEST;	// mode to fully grade/score the object
var	MODE_DESIGN			= EZ.MODE_DESIGN;		// mode to edit the object



$(document).ready(function(){
	window.setTimeout("EZ.init();", 1000);
});


/*
	Here's where we deal with various error conditions around completion detection.
*/
function getValidatedCompletion( state )
{
    var completion = "";
    if (typeof getCompletion === "function") {
      try {
        completion = getCompletion(state);
      } catch(completionErr){
        EZ.log("error occurred during getCompletion()");
        completion = "error";
      }
      if (completion === "exhausted") {
        EZ.log("getCompletion() returned exhausted");
      } else if (isNaN(completion)) {
        EZ.log("getCompletion() returned NaN");
        completion = "NaN ("+completion+")";
      } else if(completion < 0 || completion > 100) {
        EZ.log("getCompletion() returned OOB");
        completion = "OOB ("+completion+")"; 
      }
    } else {
      EZ.log("getCompletion() not implemented");
      completion = "n/a";
    }
    return completion;
}
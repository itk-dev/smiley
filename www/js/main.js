﻿var app = {
	//////////////////////////////////////////
	//// INITIALIZE
	//////////////////////////////////////////
    init: function() {
		// Setup parameters
		this.serverlocation = "http://localhost/";
		
		// Setup HTML pages to insert in header and body
		this.divWelcomeHeader = $("#div_welcome_header").html();
		this.divLoginBody = $("#div_login_body").html();
		this.divLoginHeader = $("#div_login_header").html();
		this.divRegisterBody = $("#div_register_body").html();
		this.divRegisterHeader = $("#div_register_header").html();
		this.divMainBody = $("#div_main_body").html();
		this.divWhatBody = $("#div_what_body").html();
		this.divThanksBody = $("#div_thanks_body").html();
		
		app.showWelcomePage();
	},
	
	//////////////////////////////////////////
	//// DISPLAY PAGE FUNCTIONS
	//////////////////////////////////////////
	
	showWelcomePage: function() {
		$(".main").html("");
		$(".header").html(this.divWelcomeHeader);

		// Display number of uncommitted entries on button
		// Check if local storage is supported
		var nr = 0;
		if(typeof(Storage)!=="undefined") {
			var entries = JSON.parse(localStorage.getItem("entries"));
			if (entries !== null) {
				nr = entries.length;
			} 
		} else {
			alert("Advarsel: dette device understøtter ikke Web Storage, så hvis data ikke kan afleveres til serveren, går de tabt.");
		}
		$("#commit_button").html("Indsend (" + nr + ")");
		
		$("#login_button").on("click", function() {
			app.showLoginPage();
		});
		$("#reg_button").on("click", function() {
			app.showRegisterPage();
		});
		$("#commit_button").on("click", function() {
			app.commitEntriesFromLocalStorage(function() {
				// Display number of uncommitted entries on button
				var nr = 0;
				if(typeof(Storage)!=="undefined") {
					var entries = JSON.parse(localStorage.getItem("entries"));
					if (entries !== null) {
						nr = entries.length;
					} 
				}
				$("#commit_button").html("Indsend (" + nr + ")");
			});
		});		
	},
	showRegisterPage: function() {
		$(".main").html(this.divRegisterBody);
		$(".header").html(this.divRegisterHeader);

		// Setup form register submit button
		$("#form_register").submit(function(event) {
			event.preventDefault();
			
			var serializedData = $(this).serializeArray();

			// Disable inputs, during ajax request
			var $inputs = $(this).find("input");
			$inputs.prop("disabled", true);

			// Post data to server
			$.ajax({
				url: app.serverlocation + "smiley/",
				type: "POST",
				data: serializedData,
				dataType: "json"
			})
			.done(function (response, textStatus, jqXHR){
				var resp = JSON.parse(JSON.stringify(response));
				if (resp.result == "ok") {
					app.macid = resp.macid;
					alert("Registreringen lykkedes!\r\nID'et til denne opsætning er \r\n" + app.macid + "\r\nSkriv den ned, så du har den til næste gange du skal logge denne maskine ind.");
					app.showMainPage();
				} else {
					alert("Der skete en fejl: " + resp.result + ". Prøv igen!");
				}
			})
			.fail(function (jqXHR, textStatus, errorThrown){
				alert("Der skete en fejl. Prøv igen! Dette skyldes formentlig manglende internetforbindelse eller at serveren ikke kører.");
			})
			.always(function () {
				$inputs.prop("disabled", false);
			});
			app.showMainPage();
		});
	},
	showLoginPage: function() {
		// Change HTML content
		$(".main").html(this.divLoginBody);
		$(".header").html(this.divLoginHeader);
		
		// Setup form login submit button
		$("#form_login").submit(function(event) {
			event.preventDefault();

			// Get macid
			var macid = $("#macid").val();
			
			// Disable inputs, during ajax request
			var $inputs = $(this).find("input");
			$inputs.prop("disabled", true);         

			// Post data to server
			$.ajax({
				url: app.serverlocation + "smiley/",
				type: "POST",
				data: {action: "login", macid: macid},
				dataType: "json"
			})
			.done(function (response, textStatus, jqXHR){
				var resp = JSON.parse(JSON.stringify(response));
				if (resp.result == "ok") {
					app.macid = macid;
					app.showMainPage();
				} else {
					alert("Der skete en fejl: " + resp.result + ". Prøv igen!");
				}
			})
			.fail(function (jqXHR, textStatus, errorThrown){
				alert(textStatus + " ----- " + errorThrown);
				alert("Der skete en fejl. Prøv igen! Dette skyldes formentlig manglende internetforbindelse eller at serveren ikke kører.");
			})
			.always(function () {
				$inputs.prop("disabled", false);
			});
		});
	},
	showMainPage: function() {
		// Change HTML content
		$(".header").html("");
		$(".main").html(this.divMainBody);
		
		// Setup event listeners
		$("#smiley1").on("click", function() {
			app.showWhatPage(1);
		});
		$("#smiley2").on("click", function() {
			app.showWhatPage(2);
		});
		$("#smiley3").on("click", function() {
			app.showWhatPage(3);
		});
		$("#smiley4").on("click", function() {
			app.showWhatPage(4);
		});
		$("#smiley5").on("click", function() {
			app.showWhatPage(5);
		});
	},
	showWhatPage: function(nSmiley) {
		// Change HTML content
		$(".header").html("");
		$(".main").html(this.divWhatBody);
		
		// Setup event listeners
		$("#choice1").on("click", function() {
			app.registerResult(nSmiley, 1);
		});
		$("#choice2").on("click", function() {
			app.registerResult(nSmiley, 2);
		});
		$("#choice3").on("click", function() {
			app.registerResult(nSmiley, 3);
		});		
		
		// Text
		if (nSmiley < 3) {
			$("#what_div").html("<h1>Hvad var godt?</h1>");
		} else {
			$("#what_div").html("<h1>Hvad var dårligt?</h1>");
		}
		
		// Show selected smiley, hide others
		$(".img_smiley").each(function(index) {
			if (index == nSmiley - 1)
				$(this).addClass("img_smiley_selected");
			else
				$(this).addClass("img_smiley_hide");
		});

		// Timeout hack: see if #what_div exists...
		setTimeout(function(){
			if ($("#what_div").length > 0)
				app.showMainPage();
		}, 10000);		
	},
	registerResult: function(nSmiley, nWhat) {
		$(".header").html("");
		$(".main").html(this.divThanksBody);

		var d = new Date();
		var datetime = d.getTime();
		
		// Post data to server
		app.sendResultToServer(app.macid, nSmiley, nWhat, datetime, function() {
			setTimeout(function(){
				app.showMainPage();
			}, 3000);
		});
	},
	
	
	//////////////////////////////////////////
	//// HELPER FUNCTIONS
	//////////////////////////////////////////
	
	// send a single result to the server
	sendResultToServer: function(macid, smiley, what, datetime, callback) {
		$.ajax({
			url: app.serverlocation + "smiley/",
			type: "POST",
			data: {action: "result", macid: macid, smiley: smiley, what: what, datetime: datetime},
			dataType: "json"
		})
		.done(function (response, textStatus, jqXHR){
			var resp = JSON.parse(JSON.stringify(response));
			if (resp.result != "ok") {
				app.saveEntryToLocalStorage(macid, smiley, what, datetime);
			}
			callback();
		})
		.fail(function (jqXHR, textStatus, errorThrown){
			app.saveEntryToLocalStorage(macid, smiley, what, datetime);
			callback();
		});
	},
	
	// Commit the entries that have not been sent because of connectivity issues
	commitEntriesFromLocalStorage: function(callback) {
		if(typeof(Storage)!=="undefined") {
			// Get local storage entries
			var entries = JSON.parse(localStorage.getItem("entries"));
			// Backup results
			localStorage.setItem("backup_entries", JSON.stringify(entries));
			// Clear local storage entries
			localStorage.setItem("entries", JSON.stringify([]));
			
			if (entries !== null) {
				var index;
				var ent;
				for (index = 0; index < entries.length; index++) {
					ent = entries[index];
					
					sendResultToServer(ent.macid, ent.smiley, ent.what, ent.datetime, null);
				}
			}
			
			callback();
		}
	},
	
	// Save an entry to local storage
	saveEntryToLocalStorage: function(macid, smiley, what, datetime) {
		if(typeof(Storage)!=="undefined") {
			var ent = {
				macid: macid,
				smiley: smiley,
				what: what,
				datetime: datetime
			}
		
			var entries = JSON.parse(localStorage.getItem("entries"));
		
			if (entries == null) {
				entries = [];
			} 
			entries.push(ent);

			localStorage.setItem("entries", JSON.stringify(entries));
		}
	},
};
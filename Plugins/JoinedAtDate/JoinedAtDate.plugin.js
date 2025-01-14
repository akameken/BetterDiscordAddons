﻿//META{"name":"JoinedAtDate","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/JoinedAtDate","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/JoinedAtDate/JoinedAtDate.plugin.js"}*//

class JoinedAtDate {
	getName () {return "JoinedAtDate";}

	getVersion () {return "1.0.8";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Displays the Joined At Date of the current Server for a Member in the UserPopout and UserModal.";}

	initConstructor () {
		this.labels = {};

		this.patchModules = {
			"UserPopout":"componentDidMount",
			"UserProfile":"componentDidMount"
		};

		this.languages;

		this.loadedusers = {};

		this.css = `
			${BDFDB.dotCNS.userpopout + BDFDB.dotCN.nametag} {
				margin-bottom: 4px;
			}
			${BDFDB.dotCN.userprofile} .joinedAtDate {
				margin-right: 20px;
			}
			${BDFDB.dotCNS.themelight + BDFDB.dotCN.userpopoutheadernormal} .joinedAtDate {
				color: #b9bbbe; 
			}
			${BDFDB.dotCNS.themelight + BDFDB.dotCN.userpopoutheader + BDFDB.notCN.userpopoutheadernormal} .joinedAtDate,
			${BDFDB.dotCNS.themedark + BDFDB.dotCN.userpopoutheader} .joinedAtDate {
				color: hsla(0,0%,100%,.6);
			}
			${BDFDB.dotCNS.themelight + BDFDB.dotCN.userprofiletopsectionnormal} .joinedAtDate {
				color: hsla(216,4%,74%,.6); 
			}
			${BDFDB.dotCN.themelight} [class*='topSection']${BDFDB.notCN.userprofiletopsectionnormal} .joinedAtDate,
			${BDFDB.dotCN.themedark} [class*='topSection'] .joinedAtDate {
				color: hsla(0,0%,100%,.6);
			}`;


		this.defaults = {
			settings: {
				addInUserPopout:		{value:true, 		description:"Add in User Popouts:"},
				addInUserProfil:		{value:true, 		description:"Add in User Profil Modal:"},
				addJoinedAtTime:		{value:true, 		description:"Display the Time when the User Joined:"},
				forceZeros:				{value:false, 		description:"Force leading Zeros:"}
			},
			choices: {
				joinedAtDateLang:		{value:"$discord", 	description:"Joined At Date Format:"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.getAllData(this, "settings");
		let choices = BDFDB.getAllData(this, "choices");
		let settingshtml = `<div class="${this.name}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		for (let key in choices) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild}" style="flex: 0 0 30%;">${this.defaults.choices[key].description}</h3><div class="${BDFDB.disCN.selectwrap}" style="flex: 1 1 70%;"><div class="${BDFDB.disCNS.select + BDFDB.disCNS.selectsingle + BDFDB.disCN.selecthasvalue}" type="${key}" value="${choices[key]}"><div class="${BDFDB.disCN.selectcontrol}"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignbaseline + BDFDB.disCNS.nowrap + BDFDB.disCN.selectvalue}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal} languageName" style="flex: 1 1 42%; padding:0;">${this.languages[choices[key]].name}</div><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal} languageTimestamp" style="flex: 1 1 58%; padding:0;">${this.getJoinedTime(this.languages[choices[key]].id)}</div></div><span class="${BDFDB.disCN.selectarrowzone}"><span class="${BDFDB.disCN.selectarrow}"></span></span></div></div></div></div>`;
		}
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.addEventListener(this, settingspanel, "click", ".settings-switch", () => {
			let choices = BDFDB.getAllData(this, "choices");
			for (let key in choices) settingspanel.querySelector(`${BDFDB.dotCN.select}[type='${key}'] .languageTimestamp`).innerText = this.getJoinedTime(this.languages[choices[key]].id);
		});
		BDFDB.addEventListener(this, settingspanel, "click", BDFDB.dotCN.selectcontrol, e => {this.openDropdownMenu(e);});
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
		if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			this.CurrentGuildStore = BDFDB.WebModules.findByProperties("getLastSelectedGuildId");
			this.APIModule = BDFDB.WebModules.findByProperties("getAPIBaseURL");
			this.DiscordConstants = BDFDB.WebModules.findByProperties("Permissions", "ActivityTypes", "StatusTypes");

			this.languages = Object.assign({},BDFDB.languages);

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.name}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}


	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.removeEles(".joinedAtDate");
			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	openDropdownMenu (e) {
		let selectControl = e.currentTarget;
		let selectWrap = selectControl.parentElement;
		let plugincard = BDFDB.getParentEle("li", selectWrap);

		if (!plugincard || BDFDB.containsClass(selectWrap, BDFDB.disCN.selectisopen)) return;

		BDFDB.addClass(selectWrap, BDFDB.disCN.selectisopen);
		plugincard.style.setProperty("overflow", "visible", "important");

		let type = selectWrap.getAttribute("type");
		let selectMenu = this.createDropdownMenu(selectWrap.getAttribute("value"), type);
		selectWrap.appendChild(selectMenu);

		BDFDB.addChildEventListener(selectMenu, "mousedown", BDFDB.dotCN.selectoption, e2 => {
			let language = e2.currentTarget.getAttribute("value");
			selectWrap.setAttribute("value", language);
			selectControl.querySelector(".languageName").innerText = this.languages[language].name;
			selectControl.querySelector(".languageTimestamp").innerText = this.getJoinedTime(language);
			BDFDB.saveData(type, language, this, "choices");
		});

		var removeMenu = e2 => {
			if (e2.target.parentElement != selectMenu) {
				document.removeEventListener("mousedown", removeMenu);
				selectMenu.remove();
				plugincard.style.removeProperty("overflow");
				setTimeout(() => {BDFDB.removeClass(selectWrap, BDFDB.disCN.selectisopen);},100);
			}
		};

		document.addEventListener("mousedown", removeMenu);
	}

	createDropdownMenu (choice, type) {
		let menuhtml = `<div class="${BDFDB.disCN.selectmenuouter}"><div class="${BDFDB.disCN.selectmenu}">`;
		for (let key in this.languages) {
			let isSelected = key == choice ? ` ${BDFDB.disCN.selectselected}` : ``;
			menuhtml += `<div value="${key}" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignbaseline + BDFDB.disCNS.nowrap + BDFDB.disCN.selectoption + isSelected}" style="flex: 1 1 auto; display:flex;"><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal}" style="flex: 1 1 42%;">${this.languages[key].name}</div><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal}" style="flex: 1 1 58%;">${this.getJoinedTime(this.languages[key].id)}</div></div>`
		}
		menuhtml += `</div></div>`;
		return BDFDB.htmlToElement(menuhtml);
	}

	processUserPopout (instance, wrapper) {
		if (instance.props && instance.props.user && BDFDB.getData("addInUserPopout", this, "settings")) {
			this.addJoinedAtDate(instance.props.user, wrapper.querySelector(BDFDB.dotCN.userpopoutheadertext), wrapper.parentElement);
		}
	}

	processUserProfile (instance, wrapper) {
		if (instance.props && instance.props.user && BDFDB.getData("addInUserProfil", this, "settings")) {
			this.addJoinedAtDate(instance.props.user, wrapper.querySelector(BDFDB.dotCN.userprofileheaderinfo), null);
		}
	}

	addJoinedAtDate (info, container, popout) {
		if (!info || !container || container.querySelector(".joinedAtDate")) return;
		let guildid = this.CurrentGuildStore.getGuildId();
		if (guildid) {
			if (!this.loadedusers[guildid]) this.loadedusers[guildid] = {};
			let timestamp, addTimestamp = (timestamp) => {
				if (document.contains(container)) {
					let choice = BDFDB.getData("joinedAtDateLang", this, "choices");
					let nametag = container.querySelector(BDFDB.dotCN.nametag);
					let creationDate = container.querySelector(".creationDate");
					container.insertBefore(BDFDB.htmlToElement(`<div class="joinedAtDate DevilBro-textscrollwrapper ${BDFDB.disCN.textrow}" style="max-width: ${BDFDB.getRects(BDFDB.getParentEle(popout ? BDFDB.dotCN.userpopoutheader : BDFDB.dotCN.userprofileheaderinfo, container)).width - 20}px !important;"><div class="DevilBro-textscroll">${this.labels.joinedat_text + " " + this.getJoinedTime(this.languages[choice].id, timestamp)}</div></div>`), creationDate ? creationDate : (nametag ? nametag.nextSibling : null));
					BDFDB.initElements(container.parentElement, this);
					if (popout && popout.style.transform.indexOf("translateY(-1") == -1) {
						let arect = BDFDB.getRects(document.querySelector(BDFDB.dotCN.appmount));
						let prect = BDFDB.getRects(popout);
						popout.style.setProperty("top", (prect.y + prect.height > arect.height ? (arect.height - prect.height) : prect.y) + "px");
					}
				}
			};
			if (this.loadedusers[guildid][info.id]) addTimestamp(this.loadedusers[guildid][info.id]);
			else this.APIModule.get(this.DiscordConstants.Endpoints.GUILD_MEMBER(guildid,info.id)).then(result => {
				if (result && result.body) {
					timestamp = new Date(result.body.joined_at);
					this.loadedusers[guildid][info.id] = timestamp;
					addTimestamp(timestamp);
				}
			});
		}
	}

	getJoinedTime (languageid, timestamp = new Date()) {
		let settings = BDFDB.getAllData(this, "settings");
		let timestring = settings.addJoinedAtTime ? timestamp.toLocaleString(languageid) : timestamp.toLocaleDateString(languageid);
		if (timestring && settings.forceZeros) timestring = this.addLeadingZeros(timestring);
		return timestring;
	}

	addLeadingZeros (timestring) {
		let chararray = timestring.split("");
		let numreg = /[0-9]/;
		for (let i = 0; i < chararray.length; i++) {
			if (!numreg.test(chararray[i-1]) && numreg.test(chararray[i]) && !numreg.test(chararray[i+1])) chararray[i] = "0" + chararray[i];
		}

		return chararray.join("");
	}

	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					joinedat_text:				"Pridružio"
				};
			case "da":		//danish
				return {
					joinedat_text:				"Tilmeldt den"
				};
			case "de":		//german
				return {
					joinedat_text:				"Beigetreten am"
				};
			case "es":		//spanish
				return {
					joinedat_text:				"Unido el"
				};
			case "fr":		//french
				return {
					joinedat_text:				"Inscrit le"
				};
			case "it":		//italian
				return {
					joinedat_text:				"Iscritto il"
				};
			case "nl":		//dutch
				return {
					joinedat_text:				"Aangesloten op"
				};
			case "no":		//norwegian
				return {
					joinedat_text:				"Ble med på"
				};
			case "pl":		//polish
				return {
					joinedat_text:				"Dołączył"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					joinedat_text:				"Inscreveu-se em"
				};
			case "fi":		//finnish
				return {
					joinedat_text:				"Liittynyt"
				};
			case "sv":		//swedish
				return {
					joinedat_text:				"Anlände den"
				};
			case "tr":		//turkish
				return {
					joinedat_text:				"Katıldı"
				};
			case "cs":		//czech
				return {
					joinedat_text:				"Přihlásil dne"
				};
			case "bg":		//bulgarian
				return {
					joinedat_text:				"Се присъедини на"
				};
			case "ru":		//russian
				return {
					joinedat_text:				"Присоединился"
				};
			case "uk":		//ukrainian
				return {
					joinedat_text:				"Приєднався"
				};
			case "ja":		//japanese
				return {
					joinedat_text:				"に参加しました"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					joinedat_text:				"加入了"
				};
			case "ko":		//korean
				return {
					joinedat_text:				"에 가입"
				};
			default:		//default: english
				return {
					joinedat_text:				"Joined on"
				};
		}
	}
}

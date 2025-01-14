module.exports = (Plugin, Api, Vendor) => {
	if (!global.BDFDB || typeof BDFDB != "object") global.BDFDB = {myPlugins:{}, BDv2Api: Api};

	return class extends Plugin {
		initConstructor () {
			this.patchModules = {
				"ChannelTextArea":"componentDidMount",
				"Note":"componentDidMount",
				"Modal":"componentDidMount"
			};

			this.maxLenghts = {
				normal: 2000,
				edit: 2000,
				form: 2000,
				nickname: 32,
				popout: 256,
				profile: 256
			}
			   
			this.css = `
				${BDFDB.dotCN.themelight} #charcounter {
					color: #747f8d; 
					opacity: .7;
				}
				${BDFDB.dotCN.themedark} #charcounter {
					color: #ccc;
					opacity: .5;
				}
				${BDFDB.dotCNS.typing + BDFDB.dotCN.cooldownwrapper} {
					margin-right: 64px;
				}
				.charcounter-added {
					position: relative !important;
				}
				#charcounter {
					display: block;
					position: absolute;
					z-index: 1000;
					pointer-events: none;
				}
				#charcounter.normal {
					right: 0;
					bottom: -1.3em;
				}
				#charcounter.edit {
					left: 0;
					bottom: -1.3em;
				}
				#charcounter.form {
					right: 0;
					bottom: -1.0em;
				}
				#charcounter.nickname {
					right: 0 !important;
					top: 0 !important;
				}
				#charcounter.popout {
					right: 3px !important;
					bottom: 1px !important;
					font-size: 10px !important;
				}
				#charcounter.profile {
					right: -5px !important;
					bottom: 3px !important;
					font-size: 12px !important;
				}
				${BDFDB.dotCN.usernote} textarea:not(:focus) + #charcounter {
					display: none;
				}`;
		}

		onStart () {
			if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.name] = this;
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
				if (this.started) return true;
				BDFDB.loadMessage(this);

				BDFDB.WebModules.forceAllUpdates(this);

				return true;
			}
			else {
				console.error(`%c[${this.name}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
				return false;
			}
		}


		onStop () {
			if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				BDFDB.removeEles(".charcounter");
				BDFDB.removeClasses("charcounter-added");

				BDFDB.unloadMessage(this);
				return true;
			}
			else {
				return false;
			}
		}

		
		// begin of own functions

		processChannelTextArea (instance, wrapper) {
			if (instance.props && instance.props.type && this.maxLenghts[instance.props.type]) this.appendCounter(wrapper.querySelector("textarea"), instance.props.type);
		}

		processNote (instance, wrapper) {
			this.appendCounter(wrapper.firstElementChild, BDFDB.containsClass(wrapper, BDFDB.disCN.usernotepopout) ? "popout" : (BDFDB.containsClass(wrapper, BDFDB.disCN.usernoteprofile) ? "profile" : null));
		}

		processModal (instance, wrapper) {
			if (instance.props && instance.props.tag == "form") {
				let reset = wrapper.querySelector(BDFDB.dotCN.reset);
				if (reset && BDFDB.getInnerText(reset.firstElementChild) == BDFDB.LanguageStrings.RESET_NICKNAME) this.appendCounter(wrapper.querySelector(BDFDB.dotCN.inputdefault), "nickname");
			}
		}

		appendCounter (input, type) {
			if (!input || !type) return;
			BDFDB.removeEles(input.parentElement.querySelectorAll("#charcounter"));
			var counter = BDFDB.htmlToElement(`<div id="charcounter" class="charcounter ${type}"></div>`);
			input.parentElement.appendChild(counter);

			var updateCounter = () => {counter.innerText = input.value.length + "/" + (this.maxLenghts[type] || 2000) + (input.selectionEnd - input.selectionStart == 0 ? "" : " (" + (input.selectionEnd - input.selectionStart) + ")");};

			BDFDB.addClass(input.parentElement.parentElement, "charcounter-added");
			if (type == "nickname") input.setAttribute("maxlength", 32);
			BDFDB.addEventListener(this, input, "keydown click", e => {
				clearTimeout(input.charcountertimeout);
				input.charcountertimeout = setTimeout(() => {updateCounter();},100);
			});
			BDFDB.addEventListener(this, input, "mousedown", e => {
				BDFDB.addEventListener(this, document, "mouseup", () => {
					BDFDB.removeEventListener(this, document);
					if (input.selectionEnd - input.selectionStart) setImmediate(() => {BDFDB.addEventListener(this, document, "click", () => {
						input.selectionStart = 0;
						input.selectionEnd = 0;
						updateCounter();
						BDFDB.removeEventListener(this, document);
					});});
				});
				BDFDB.addEventListener(this, document, "mousemove", () => {setTimeout(() => {updateCounter();},10);});
			});

			updateCounter();
		}
	}
};

class Toast {

    element;
    autoCloseTimeout;
    autoCloseTime;
    progressInterval;
    visibleSince;
    closeBtn;

    DEFAULT_OPTIONS = {
        autoClose: 5000,
        position: "top-right",
        onClose: () => {},
        closeBtn: true,
        showProgress: true,
        progressColor: "#2d8fff"
    }
    /**
     * 
     * @param {{content: String, position: String, autoClose: Number, closeBtn: Boolean, progressColor: String, showProgress: Boolean}} options 
     */
    constructor (options) {
        this.closeBtn = options.closeBtn === false ? false : true;
        this.autoCloseTimeout = null;
        this.autoCloseTime = null;
        this.visibleSince = Date.now();
        this.element = this._createToast();
        this.update({...this.DEFAULT_OPTIONS, ...options})
        requestAnimationFrame(() => {
            this.element.classList.add(this.CSS.toastShow);
        });
        
    }

    /**
     * 
     * @param {{content: String, position: String, autoClose: Number}} options 
     */
    update (options) {
        Object.entries(options).forEach(([key, value]) => {
            this[key] = value;
        })
    }

    remove () {
        const container = this.element.parentElement;

        if(this.autoCloseTimeout !== null) clearTimeout(this.autoCloseTimeout);
        if(this.progressInterval !== null) clearInterval(this.progressInterval);
        if(this.element !== null) {
            this.element.classList.remove(this.CSS.toastShow);
            this.element.addEventListener("transitionend", () => {
                this.element.remove();

                if(container === null || container.hasChildNodes()) return;
                container.remove();
            })
        }

        this.onClose();
    }

    set progressColor (value) {
        this.element.querySelector("." + this.CSS.toastProgress).style.setProperty("--progress-color", value);
    }

    set showProgress (value) {
        if(value !== true) return;
        let progressbar = this.element.querySelector("." + this.CSS.toastProgress);
        progressbar.style.setProperty("--progress", 1);
        
        this.progressInterval = setInterval(() => {
            const timeVisible = Date.now() - this.visibleSince
            progressbar.style.setProperty("--progress",  1 - timeVisible / this.autoCloseTime);
        }, 10);
    }

    onClose () {

    }
    
    _createToast () {
        let toast = document.createElement("div");
        let toast_body = document.createElement("div");
        let progressbar = document.createElement("div");
        
        
        toast.classList.add(this.CSS.toast);
        toast_body.classList.add(this.CSS.toastBody);
        progressbar.classList.add(this.CSS.toastProgress);
        
        
        toast.appendChild(toast_body);

        if(this.closeBtn === true) {
            let closeBtn = document.createElement("button");
            closeBtn.classList.add(this.CSS.toastCloseBtn);
            closeBtn.innerHTML = '<svg aria-hidden="true" viewBox="0 0 14 16"><path fill-rule="evenodd" d="M7.71 8.23l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75L1 11.98l3.75-3.75L1 4.48 2.48 3l3.75 3.75L9.98 3l1.48 1.48-3.75 3.75z"></path></svg>'
            toast.appendChild(closeBtn);  

            closeBtn.addEventListener("click", () => {
                this.onClose();
                this.remove();
            })
        }

        toast.appendChild(progressbar);

        toast.addEventListener("click", () => {
            this.onClose();
            this.remove();
        })

        return toast;
    }

    set autoClose (value) {
        if(!value || value < 0) return;
        if(this.autoCloseTimeout !== null) clearTimeout(this.autoCloseTimeout);
        this.autoCloseTime = value;
        this.autoCloseTimeout = setTimeout(this.remove.bind(this), value);
    }

    set position (position) {
        const currentContainer = this.element.parentElement;
        
        const container = document.querySelector("." + this.CSS.toastContainer + `[data-position="${position}"]`) || this._createContainer(position); 
        container.appendChild(this.element);

        if(currentContainer === null || currentContainer.hasChildNodes()) return;
        currentContainer.remove();
    }

    set content (content) {
        this.element.querySelector("." + this.CSS.toastBody).innerText = content;
    }

    _createContainer (position) {
        let container = document.createElement("div");
        container.classList.add(this.CSS.toastContainer);
        container.setAttribute("data-position", position);

        document.body.appendChild(container);

        return container;
    }

    get CSS () {
        return {
            toast: "toast",
            toastContainer: "toast-container",
            toastCloseBtn: "toast--closeBtn",
            toastBody: "toast-body",
            toastProgress: "toast-progressbar",
            toastShow: "toast-show",
            progressShow: "progressbar-run"
        }
    }
}
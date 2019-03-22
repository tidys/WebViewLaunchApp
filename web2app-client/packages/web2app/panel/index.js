const PackageName = "web2app";
let Fs = require("fire-fs");
let Path = require("fire-path");
const Express = require('express');
const Electron = require('electron');


Editor.Panel.extend({
    _hookRouter: null,
    style: Fs.readFileSync(Editor.url(`packages://${PackageName}/panel/index.css`), 'utf8'),
    template: Fs.readFileSync(Editor.url(`packages://${PackageName}/panel/index.html`), 'utf8'),
    ready() {
        this.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                this.onOpenServer();
            },
            data: {
                initApp: false,
                httpServer: null,
                httpDocs: null,
                httpPort: 3000,

                hookRouter: null,
                build2run: false,
            },
            methods: {
                onOpenServer() {
                    if (this.initApp === false) {
                        this.initApp = true;
                        this.httpDocs = Path.join(Editor.projectInfo.path, "doc/");
                        let app = Express();
                        // app.get('/a.html', function (req, res) {
                        //     res.send("hello !")
                        //
                        // });
                        app.use(Express.static(this.httpDocs));
                        app.listen(this.httpPort, function () {
                            console.log(`app listening on port ${this.httpPort} `);
                        });
                        this.httpServer = app;
                    }
                },
                hookPreviewServer() {
                    if (this.hookRouter === null) {
                        debugger
                        let router = require('express').Router();
                        if (Editor.isMainProcess) {
                            Editor.PreviewServer.userMiddlewares.push(router);
                        } else {
                            Editor.remote.PreviewServer.userMiddlewares.push(router);
                        }
                        // this.httpServer.userMiddlewares.push(router);
                        this.hookRouter = router;
                        router.get("/pay.html", function (req, res, next) {
                            debugger
                            res.send("hello pay.html");
                            // let html = Path.join(Editor.projectInfo.path, "doc/pay.html");
                            // if (Fs.existsSync(html)) {
                            //     res.sendFile(html);
                            // }
                        })
                    }
                },
                buildFinished(data) {
                    // 将构建后的目录文件拷贝到express指向的目录
                    const FsExtra = Editor.require(`packages://${PackageName}/node_modules/fs-extra`);
                    FsExtra.copySync(data.dest, this.httpDocs);
                    if (this.build2run) {
                        this.run();
                    }
                },
                run() {
                    let url = `http://localhost:${this.httpPort}/index.html`;
                    Electron.shell.openExternal(url);
                }
            }

        })

    },

    messages: {
        'web2app:hello'(event) {

        },
        'editor:build-finished'(event, data) {
            this.plugin.buildFinished(data);
        }
    }
});
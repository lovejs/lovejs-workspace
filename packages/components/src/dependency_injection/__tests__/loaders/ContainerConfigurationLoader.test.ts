import * as _ from "lodash";
import { ConfigurationError } from "../../../configuration";
import { ContainerConfigurationLoader, Tag, Call, Service, _service, _parameter } from "../..";

const getInstance = () => {
    return new ContainerConfigurationLoader();
};

const invalidDefinitions = {
    services: {
        invalid: {}
    }
};

const validDefinitions = {
    parameters: {
        p1: "string",
        p2: ["1", "2", "3"],
        p3: { test: 1 },
        p4: test => test
    },
    services: {
        service1: {
            module: "unknow",
            args: [_service("service2")],
            tags: ["test1", "test2"],
            calls: [{ method: "method1", args: [_service("Service2")] }]
        },
        service2: {
            factory: { service: "test" },
            tags: "test"
        },
        service3: {
            factory: { service: "service1" },
            parent: "other_service"
        }
    }
};

const importDefinitions = {
    imports: [__dirname + "/data/services.js"]
};

describe("#Di [Container Configuration Loader]", function() {
    it("Create instance of an DefinitionsLoader", () => {
        expect(getInstance()).toBeInstanceOf(ContainerConfigurationLoader);
    });

    it("Should return an error if definitions are invalid", async () => {
        expect.assertions(1);
        const check = async () => await getInstance().load(invalidDefinitions);

        await expect(check()).rejects.toThrow(ConfigurationError);
    });

    it("Should accept valid definitions", async () => {
        const { services, parameters } = await getInstance().load(validDefinitions);

        expect(_.size(services)).toBe(3);
        expect(_.size(parameters)).toBe(4);
    });

    it("Should return correct values for fields", async () => {
        const {
            services: { service1, service2, service3 }
        } = await getInstance().load(validDefinitions);

        expect(service1.getTags().length).toBe(2);
        expect(service1.getTags()[0]).toBeInstanceOf(Tag);
        expect(service1.getTags()[0]).toMatchObject({ name: "test1" });
        expect(service1.getTags()[1]).toBeInstanceOf(Tag);
        expect(service1.getTags()[1]).toMatchObject({ name: "test2" });

        expect(service1.getCalls()).toBeDefined();
        expect(Array.isArray(service1.getCalls())).toBe(true);
        expect(service1.getCalls().length).toBe(1);
        expect(service1.getCalls()[0]).toBeInstanceOf(Call);

        expect(Array.isArray(service2.getTags())).toBe(true);
        expect(service2.getTags()[0]).toMatchObject({ name: "test" });
        expect(service1.getTags()[0]).toBeInstanceOf(Tag);

        expect(service3.getParent()).toBeUndefined();
        expect(service3.getParentId()).toBe("other_service");
    });

    it("Transform a valid definition to a service", () => {
        const definition = {
            module: "test",
            args: [],
            tags: [],
            calls: [],
            shared: true,
            preloaded: true,
            autowired: true
        };

        const service = getInstance().definitionToService(definition);
        expect(service).toBeInstanceOf(Service);
    });

    it("Should accept tags in multiple format (string, object, array)", async () => {
        const { services } = await getInstance().load({
            services: {
                s1: {
                    module: "module",
                    tags: "mytag"
                },
                s2: {
                    module: "module",
                    tags: { tag: "mytag" }
                },
                s3: {
                    module: "module",
                    tags: ["mytag"]
                },
                s4: {
                    module: "module",
                    tags: [{ tag: "mytag" }]
                }
            }
        });

        _.each(["s1", "s2", "s3", "s4"], s => {
            expect(services[s].getTags().length).toBe(1);
            expect(services[s].getTags()[0]).toBeInstanceOf(Tag);
            expect(services[s].getTags()[0].getName()).toBe("mytag");
        });
    });

    it("Service loader should be able to import other files", async () => {
        const instance = new ContainerConfigurationLoader({ resolve: a => (_.isString(a) ? require(a) : a) });
        const { services } = await instance.load(importDefinitions);

        expect(services.s1).toBeDefined();
    });

    // XXX need more tests
    it("Service loader should support auto-generated services", async () => {
        const { services } = await getInstance().load({
            services: {
                "s.*": {
                    from: __dirname + "/data/auto"
                }
            }
        });

        expect(services["s.s1"]).toBeDefined();
        expect(services["s.s2"]).toBeDefined();
        expect(services["s.s3"]).toBeDefined();
        expect(services["s.auto2.s1"]).toBeDefined();
        expect(services["s.auto2.s2"]).toBeDefined();
        expect(services["s.auto2.s3"]).toBeDefined();
    });
});

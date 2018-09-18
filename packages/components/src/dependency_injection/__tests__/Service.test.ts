import { Call, Service, Tag } from "../index";

const service = new Service("module");

describe("#DI [Service]", function() {
    it("Create instance of Service and getModule", () => {
        expect(service).toBeInstanceOf(Service);
        expect(service.getModule()).toBe("module");
    });

    it("Getter, Setter and fluent api on setters", () => {
        expect(service.setModule("test")).toBe(service);
        expect(service.getModule()).toBe("test");

        expect(service.setPreloaded(true)).toBe(service);
        expect(service.isPreloaded()).toBe(true);

        expect(service.setShared(true)).toBe(service);
        expect(service.isShared()).toBe(true);

        expect(service.setAutowired(true)).toBe(service);
        expect(service.isAutowired()).toBe(true);
    });

    it("getArguments, setArguments", () => {
        expect(service.getArguments()).toEqual([]);
        expect(service.setArguments(["a"]).getArguments()).toEqual(expect.arrayContaining(["a"]));

        // @ts-ignore
        expect(() => service.setArguments("1")).toThrowError();
        // @ts-ignore
        expect(() => service.setArguments(123)).toThrowError();
        // @ts-ignore
        expect(() => service.setArguments({ a: "1" })).toThrowError();
    });

    it("addTag, getTag, getTags, setTags", () => {
        // @ts-ignore
        expect(() => service.addTag("not_a_tag")).toThrowError(Error);

        const tag1 = new Tag("tag1");
        const tag2 = new Tag("tag2");

        const tags = [tag1];

        expect(service.setTags(tags)).toBe(service);
        expect(service.getTags()).toEqual(expect.arrayContaining(tags));

        expect(service.addTag(tag2)).toBe(service);
        expect(service.getTags()).toEqual(expect.arrayContaining([tag1, tag2]));

        expect(service.getTag("tag2")).toBe(tag2);
        expect(service.getTag("unknow")).toBe(false);
    });

    it("addCall, hasCalls, getCalls, setCalls", () => {
        // @ts-ignore
        expect(() => service.addCall("not_a_call")).toThrowError(Error);

        const call1 = new Call("method1");
        const call2 = new Call("method2");

        const calls = [call1];

        expect(service.setCalls(calls)).toBe(service);
        expect(service.hasCalls()).toBe(true);
        expect(service.getCalls()).toEqual(expect.arrayContaining(calls));

        expect(service.addCall(call2)).toBe(service);
        expect(service.getCalls()).toEqual(expect.arrayContaining([call1, call2]));
    });
});

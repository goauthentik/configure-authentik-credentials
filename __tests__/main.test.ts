import * as core from "@actions/core";
import * as main from "../src/main";
import * as token from "../src/token";

const runMock = jest.spyOn(main, "run");
const getTokenMock = jest.spyOn(token, "getAuthentikToken");
const getIDTokenMock = jest.spyOn(core, "getIDToken");

let getInputMock: jest.SpiedFunction<typeof core.getInput>;
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>;

describe("action", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getInputMock = jest.spyOn(core, "getInput").mockImplementation();
    setFailedMock = jest.spyOn(core, "setFailed").mockImplementation();
    setOutputMock = jest.spyOn(core, "setOutput").mockImplementation();
  });

  it("sets token output", async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case "authentik_url":
          return "http://localhost:9000";
        case "client_id":
          return "foo";
        default:
          return "";
      }
    });

    getIDTokenMock.mockImplementation(async () => {
      return "gh-token";
    });

    getTokenMock.mockImplementation(async () => {
      return { access_token: "test-token" };
    });

    await main.run();
    expect(runMock).toHaveReturned();

    expect(getTokenMock).toHaveBeenCalledWith("http://localhost:9000", "foo", "gh-token");
    expect(setOutputMock).toHaveBeenNthCalledWith(1, "token", "test-token");
    expect(setFailedMock).not.toHaveBeenCalled();
  });

  it("sets a failed status", async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case "authentik_url":
          return "http://localhost:9000";
        case "client_id":
          return "foo";
        default:
          return "";
      }
    });

    getIDTokenMock.mockImplementation(async () => {
      return "gh-token";
    });

    getTokenMock.mockImplementation(async () => {
      throw new Error("foo");
    });

    await main.run();
    expect(runMock).toHaveReturned();

    expect(setFailedMock).toHaveBeenNthCalledWith(1, "foo");
  });
});

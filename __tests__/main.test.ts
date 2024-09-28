import * as core from "@actions/core";
import * as main from "../src/main";
import * as token from "../src/token";
import { sign } from "jsonwebtoken";

const runMock = jest.spyOn(main, "run");
const getTokenMock = jest.spyOn(token, "getAuthentikToken");
const getIDTokenMock = jest.spyOn(core, "getIDToken");

let infoMock: jest.SpiedFunction<typeof core.info>;
let getInputMock: jest.SpiedFunction<typeof core.getInput>;
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>;

describe("action", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    infoMock = jest.spyOn(core, "info").mockImplementation();
    getInputMock = jest.spyOn(core, "getInput").mockImplementation();
    setFailedMock = jest.spyOn(core, "setFailed").mockImplementation();
    setOutputMock = jest.spyOn(core, "setOutput").mockImplementation();

    infoMock.mockImplementation(async messages => {
      console.log(messages);
    });
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

    const githubToken = sign(
      {
        aud: "foo",
        iss: "bar"
      },
      "foo"
    );
    getIDTokenMock.mockImplementation(async () => {
      return githubToken;
    });

    const finalToken = sign(
      {
        aud: "foo",
        iss: "bar"
      },
      "foo"
    );
    getTokenMock.mockImplementation(async () => {
      console.log("getIDTokenMock");
      return {
        access_token: finalToken
      };
    });

    await main.run();
    expect(runMock).toHaveReturned();

    expect(getTokenMock).toHaveBeenCalledWith("http://localhost:9000", "foo", githubToken);
    expect(setOutputMock).toHaveBeenNthCalledWith(1, "token", finalToken);
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

    const githubToken = sign(
      {
        aud: "foo",
        iss: "bar"
      },
      "foo"
    );
    getIDTokenMock.mockImplementation(async () => {
      return githubToken;
    });

    getTokenMock.mockImplementation(async () => {
      throw new Error("foo");
    });

    await main.run();
    expect(runMock).toHaveReturned();

    expect(setFailedMock).toHaveBeenNthCalledWith(1, "foo");
  });
});

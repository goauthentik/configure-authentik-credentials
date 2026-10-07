import * as core from "@actions/core";
import * as main from "../src/main";
import * as token from "../src/token";
import * as jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi, type SpyInstance } from "vitest";

vi.mock("@actions/core", { spy: true });

const runMock = vi.spyOn(main, "run");
const getTokenMock = vi.spyOn(token, "getAuthentikToken");
const getIDTokenMock = vi.spyOn(core, "getIDToken");

let infoMock: SpyInstance;
let getInputMock: SpyInstance;
let setFailedMock: SpyInstance;
let setOutputMock: SpyInstance;
let setSecretMock: SpyInstance;

describe("action", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    infoMock = vi.spyOn(core, "info").mockImplementation(async () => {});
    getInputMock = vi.spyOn(core, "getInput").mockImplementation(() => {
      return "";
    });
    setFailedMock = vi.spyOn(core, "setFailed").mockImplementation(async () => {});
    setOutputMock = vi.spyOn(core, "setOutput").mockImplementation(async () => {});
    setSecretMock = vi.spyOn(core, "setSecret").mockImplementation(() => {});

    infoMock.mockImplementation(async (messages: string[]) => {
      console.log(messages);
    });
  });

  it("sets token output", async () => {
    getInputMock.mockImplementation((name: string) => {
      switch (name) {
        case "authentik_url":
          return "http://localhost:9000";
        case "client_id":
          return "foo";
        default:
          return "";
      }
    });

    const githubToken = jwt.sign(
      {
        aud: "foo",
        iss: "bar"
      },
      "foo"
    );
    getIDTokenMock.mockImplementation(async () => {
      return githubToken;
    });

    const finalToken = jwt.sign(
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

    expect(getIDTokenMock).toHaveBeenCalledWith("http://localhost:9000");
    expect(getTokenMock).toHaveBeenCalledWith("http://localhost:9000", "foo", githubToken, "");
    expect(setSecretMock).toHaveBeenCalledWith(finalToken);
    expect(setSecretMock.mock.invocationCallOrder[0]).toBeLessThan(
      setOutputMock.mock.invocationCallOrder[0]
    );
    expect(setOutputMock).toHaveBeenNthCalledWith(1, "token", finalToken);
    expect(setFailedMock).not.toHaveBeenCalled();
  });

  it("sets a failed status", async () => {
    getInputMock.mockImplementation((name: string) => {
      switch (name) {
        case "authentik_url":
          return "http://localhost:9000";
        case "client_id":
          return "foo";
        default:
          return "";
      }
    });

    const githubToken = jwt.sign(
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
    expect(setSecretMock).not.toHaveBeenCalled();
    expect(setOutputMock).not.toHaveBeenCalled();
  });
});

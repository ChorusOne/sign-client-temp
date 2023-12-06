import { SignClientTypes, ISignClient, ISignClientEvents } from "@walletconnect/types";
export declare class SignClient extends ISignClient {
    readonly protocol = "wc";
    readonly version = 2;
    readonly name: ISignClient["name"];
    readonly metadata: ISignClient["metadata"];
    core: ISignClient["core"];
    logger: ISignClient["logger"];
    events: ISignClient["events"];
    engine: ISignClient["engine"];
    session: ISignClient["session"];
    proposal: ISignClient["proposal"];
    pendingRequest: ISignClient["pendingRequest"];
    static init(opts?: SignClientTypes.Options): Promise<SignClient>;
    constructor(opts?: SignClientTypes.Options);
    get context(): string;
    get pairing(): import("@walletconnect/types").IPairingStore;
    on: ISignClientEvents["on"];
    once: ISignClientEvents["once"];
    off: ISignClientEvents["off"];
    removeListener: ISignClientEvents["removeListener"];
    removeAllListeners: ISignClientEvents["removeAllListeners"];
    connect: ISignClient["connect"];
    pair: ISignClient["pair"];
    approve: ISignClient["approve"];
    reject: ISignClient["reject"];
    update: ISignClient["update"];
    extend: ISignClient["extend"];
    request: ISignClient["request"];
    respond: ISignClient["respond"];
    ping: ISignClient["ping"];
    emit: ISignClient["emit"];
    disconnect: ISignClient["disconnect"];
    find: ISignClient["find"];
    getPendingSessionRequests: ISignClient["getPendingSessionRequests"];
    private initialize;
}
//# sourceMappingURL=client.d.ts.map
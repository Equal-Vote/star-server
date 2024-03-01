import { testMockUserStore } from "../auth/test/TestMockUserStore";
import { testDBCounter } from "./DBTest";

export async function tempTestSuite(): Promise<string> {

    var tests = [
        testMockUserStore(),
        testDBCounter()
    ];

    var combine = await Promise.all(tests);
    return "Test Results:  " + combine.join(",  ");
}

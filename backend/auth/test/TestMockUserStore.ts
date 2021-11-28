import { UserModel } from "../data_model/UserModel";
import { MockUserStore } from "../MockUserStore";



export async function testMockUserStore(): Promise<string> {

    var store = new MockUserStore();

    var user1 = new UserModel();
    user1.email = "test1@test.com";
    user1.id = "1";
    user1.hashedPassword = "asdf";
    user1.salt = "asdf";

    var user2 = user1.copy();
    user2.email = "test2@test.com";
    user2.id = "2";

    store.set(user1);
    store.set(user2);

    var res = await store.getByEmail(user1.email);
    assertSame(res.toJson(), user1.toJson(), "getByEmail should return matching user");

    res = await store.getById(user2.id);
    assertSame(res.toJson(), user2.toJson(), "getById should return matching user");

    var oldEmail = user1.email;
    user1.email = "another@test.com";
    await store.set(user1);

    res = await store.getByEmail(oldEmail);
    assertSame(res, null, "getByEmail should be null after the user's email was changed");

    return "testMockUserStore -> pass";
}


function assertSame(data1:any, data2:any, message:string) {
    if (data1 != data2){
        throw(new Error(`${message}\n${JSON.stringify(data1)} != ${JSON.stringify(data2)}`));
    }
}
import Vue, {PluginFunction, PluginObject} from "vue";
import {Api} from "@/apis";

declare module "vue/types/vue" {

  interface Vue {
    api: Api;
  }

  interface VueConstructor {
    api: Api;
  }
}

declare class VueApi {
  static install: PluginFunction<Api>;
}

export default VueApi;

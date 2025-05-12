# eComm Toolkit

`dc-extension-ecomm-toolkit` is an Amplience Dynamic Content extension written in React/MUI/Typescript that provides an easy way to interface with SFCC.

#### ⚙️ Features

-   CTA Field with Product/Category/ExtURL selection

## 🏁 Quickstart

- [Developing and Building Locally](./docs/developing%2Bbuilding-locally.md).
- Instructions for basic registration & setup of the ecomm-toolkit in your Amplience Dynamic Content box [are here](./docs/extension.md). Then come back to the Snippets section below.
- If you're hosting the extension yourself and want to use features that are not allowed by CORS versions of vendor APIs, you can define the environment variable `INTEGRATION_MIDDLEWARE_SERVER=1` to allow the next server to host the middleware proxy, which should allow use of any API. This will also switch builds of the extension to attempt to use the middleware API by default instead of making CORS requests.
- `middleware_url` can be provided on the extension config to use any middleware API server regardless of environment variable.

> Note: This extension also supports Big Commerce Server calls for access to 'customer groups'. This is an example of the server implementation and self hosting as per above. Configuration and codec parameters for this are here: [BigCommerce](./docs/commerce/bigcommerce.md)

## 🧩 Extension Snippets

Since the eComm Toolkit requires a number of "Instance Parameters", we recommend providing a number of extension snippets for ease of use and to ensure functionality. By including Snippets in an extension registration, you'll be able to quickly configure properties when you're editing/creating a Content Schema that are automatically associated with an extension.

![Extension Snippets](./docs/media/ext-snipSelections.png)

The Instance Parameters are all included in the snippets and will drive how the extension looks and functions, and what type of data will be retrieved from your eComm platform.

You can find the code for all snippets in [data/snippets.json](./data/snippets.json)

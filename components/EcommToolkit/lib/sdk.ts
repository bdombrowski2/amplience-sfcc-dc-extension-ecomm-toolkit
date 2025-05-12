import { flattenCategories, CodecErrorType, CommerceCodec, CommerceAPI, getCommerceAPI as getCommerceApiRaw } from '@amplience/dc-integration-middleware';
import { ContentFieldExtension, init } from 'dc-extensions-sdk';


const getCommerceApi = async (config: any) => configuredApi = configuredApi || await getCommerceApiRaw(config)
let configuredApi: CommerceAPI

interface ExtParameters {
    instance: {
        fieldType: string
    }
    installation: CommerceCodec
}


export type AmplienceSDK = Awaited<ReturnType<typeof initAmplienceSDK>>;

export async function initAmplienceSDK() {
    const sdk = await init<ContentFieldExtension<any, ExtParameters>>({ debug: true }).catch(enhanceErrorMessage)
    const commerceApi = await getCommerceApi(sdk.params.installation).catch(enhanceErrorMessage);
    
    let value = await sdk.field.getValue()

    let ampSDK = {
        fieldType: sdk.params.instance.fieldType,
        getTitle: () => sdk.field.schema?.title,
        getDescription: () => sdk.field.schema?.description,
        getValue: () => value,
        getCategories: async () => {
            let categoryTree: any[] = await commerceApi.getCategoryTree({})
            let categoriesFlat = flattenCategories(categoryTree).map(cat => ({ name: `(${cat.slug}) ${cat.name}`, slug: cat.slug, id: cat.id }))
            return categoriesFlat
        },
        getProduct: commerceApi.getProduct.bind(commerceApi),
        setValue: async (newValue: any) => {
            if (newValue) {
                await sdk.field.setValue(newValue)
                value = newValue
            }
        },
        clearValue: async () => {
            await sdk.field.setValue()
            value = null;
        },
        setHeight: (height) => {
            sdk.frame.setHeight(height)
        },
        maxItems: sdk.field.schema?.maxItems
    }

    return ampSDK
}

/**
 * enhances an error from the Amplience SDK with a better error message
 */
function enhanceErrorMessage(e: any): never {
    const docsUrl = 'https://github.com/amplience/dc-extension-ecomm-toolkit/blob/main/docs/errors.md'
    e.messageRaw = e.message

    if (e.type) {
        switch (e.type) {
            case CodecErrorType.Cors:
                e.message = `Cross-Origin Request Blocked. Make sure that you have properly configured your vendor to accept requests from ${window.location.origin}.\n\nSee ${docsUrl}#cors for more information.`
            case CodecErrorType.NotAuthenticated:
            case CodecErrorType.AuthError:
            case CodecErrorType.AuthUnreachable:
                e.message = `Authentication error, make sure your authentication params are properly configured.\n\nSee ${docsUrl}#authentication-error for more information.\n\n${e.message}`
            case CodecErrorType.ApiError:
            case CodecErrorType.ApiGraphQL:
                e.message = `API Error, make sure your params are properly configured.\n\nSee ${docsUrl}#api-error for more information.\n\n${e.message}`
            case CodecErrorType.NotSupported:
                e.message = `Method not supported by vendor.\n\nSee ${docsUrl}#not-supported for more information.\n\n${e.message}`
        }

        e.message = `Encountered error '${CodecErrorType[e.type]}'. See ${docsUrl}#other for more information.\n\n${e.message}`;
    } else {
        e.message = e.toString();
    }
    throw e;
}
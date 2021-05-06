export class GenericHelper {
  public static sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

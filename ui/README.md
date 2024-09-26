# EPCIS Blockchain Admin Panel

## Follow these steps to capture, query, and trace EPCIS chaincode:

1. Go to backend project folder(/api) within the EPCIS-CHAINCODE umbrella project.

    ```
    cd api
    cd validators/schema/examples
    ls
    ```

2. Select a template to test, for example, `ObjectEvent.json`.

3. On the Capture Interface page in the UI (URL: `/app/capture`), copy and paste the chosen template. Then, click the CAPTURE button to capture an event.

4. On the Query Interface page in the UI (URL: `/app/query`), click the GET ALL EVENTS button. You will see the list of queries of the data you captured.

5. On the Traceability Interface page in the UI (URL: `/app/traceability`), choose a product to trace. For instance:
   - Go back to the `ObjectEvent.json` template that you used to capture.
   - Look for the `epcList` variable and choose one from the array to trace.

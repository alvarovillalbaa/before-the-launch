# Execution controls: first attempt

[CI run 41946314758](https://github.com/alvarovillalbaa/before-the-launch/actions/runs/41946314758),
job 126979282875, checked source `640e11b63295a6f79978f435958897b0b3c62462`.
The controller stopped with `dynamic_test_title` during source case-inventory
parsing, after frozen dependency installation. **No product, PostgreSQL or browser
case ran; no schema was provisioned and no production key changed.**

All 16 commands exited zero. All three reached source guards passed against
1,033 tracked leaves / 8,333,890 bytes; generated dependencies and owned scratch
were removed, with no ignored output remaining. GitHub's Stop containers step
also succeeded. This setup/controller failure is not a product-test failure.

The [JSON receipt](execution-controls-attempt-1.json) retains the complete raw
controller result and lossless compressed job log. The new source scope remains
unverified. The following attempt must preserve this failure and its source.

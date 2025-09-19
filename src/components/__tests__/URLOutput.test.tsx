import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { URLOutput } from "../URLOutput";

describe("URLOutput", () => {
  it("invokes copy handler when enabled", async () => {
    const user = userEvent.setup();
    const handleCopy = vi.fn();
    render(
      <URLOutput
        value="https://xget.example.com/gh/org/repo"
        canCopy
        onCopy={handleCopy}
        copied={false}
        isCopyPending={false}
      />
    );

    await user.click(screen.getByRole("button", { name: "复制转换后的 URL" }));
    expect(handleCopy).toHaveBeenCalledTimes(1);
  });

  it("shows copied state", () => {
    render(
      <URLOutput
        value="https://xget.example.com/gh/org/repo"
        canCopy
        onCopy={() => undefined}
        copied
        isCopyPending={false}
      />
    );

    expect(screen.getByRole("button", { name: "复制转换后的 URL" })).toHaveTextContent("已复制");
  });

  it("disables copy button when unavailable", () => {
    render(
      <URLOutput
        value=""
        canCopy={false}
        onCopy={() => undefined}
        copied={false}
        isCopyPending={false}
      />
    );

    expect(screen.getByRole("button", { name: "复制转换后的 URL" })).toBeDisabled();
  });
});

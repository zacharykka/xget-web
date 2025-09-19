import { fireEvent, render, screen } from "@testing-library/react";
import { URLInput } from "../URLInput";

describe("URLInput", () => {
  it("propagates value changes", () => {
    const handleChange = vi.fn();
    render(
      <URLInput
        value=""
        onValueChange={handleChange}
        status={{ message: "", hasError: false }}
      />
    );

    fireEvent.change(screen.getByLabelText("原始 URL"), { target: { value: "github.com/xixu-me/Xget" } });
    expect(handleChange).toHaveBeenCalledWith("github.com/xixu-me/Xget");
  });

  it("renders error status state", () => {
    const handleBlur = vi.fn();
    render(
      <URLInput
        value="bad-url"
        onValueChange={() => undefined}
        onBlur={handleBlur}
        status={{ message: "格式不正确", hasError: true }}
      />
    );

    const input = screen.getByLabelText("原始 URL");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("格式不正确");

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });
});
